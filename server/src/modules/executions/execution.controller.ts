import { FastifyInstance } from 'fastify';
import { Readable } from 'stream';
import { executionEmitter } from './execution.events';
import { OnhandlSDKInternal } from '../../sdk/onhandl-sdk-internal';
import {
    cookieAuthSecurity,
    executionIdParamSchema,
    executionSchema,
    standardErrorResponses,
} from '../../shared/docs';

/**
 * ExecutionController: Endpoints for monitoring and controlling agent runtime
 * executions.
 */
export async function executionController(fastify: FastifyInstance) {

    // GET /executions/:id - Fetch single record
    fastify.get<{ Params: { id: string } }>('/:id', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Executions'],
            summary: 'Get execution by ID',
            description: 'Returns the full state, logs, and status of a specific agent execution.',
            security: [cookieAuthSecurity],
            params: executionIdParamSchema(),
            response: {
                200: {
                    description: 'Execution details',
                    ...executionSchema,
                },
                ...standardErrorResponses([401, 403, 404, 500]),
            },
        },
    }, async (request, reply) => {
        try {
            return await OnhandlSDKInternal.getExecution(request.params.id, { userId: request.user.id, type: 'user' });
        } catch (err: any) { return reply.code(err.code || 500).send({ error: err.message }); }
    });

    // GET /executions/:id/stream - Real-time SSE logs
    fastify.get<{ Params: { id: string } }>('/:id/stream', {
        schema: {
            tags: ['Executions'],
            summary: 'Stream execution events (SSE)',
            description: 'Subscribes to real-time events for an active execution. Emits JSON data for node starts, finishes, and final results.',
            params: executionIdParamSchema(),
            response: {
                200: {
                    description: 'Real-time event stream',
                    type: 'string',
                    content: { 'text/event-stream': { schema: { type: 'string' } } },
                },
            },
        },
    }, (request, reply) => {
        const { id } = request.params;
        const origin = request.headers.origin || 'http://localhost:3000';
        const stream = new Readable({ read() { } });
        stream.push(`data: ${JSON.stringify({ type: 'connected', executionId: id })}\n\n`);
        const listener = (data: any) => {
            stream.push(`data: ${JSON.stringify(data)}\n\n`);
            if (data.status === 'completed' || data.status === 'failed' || data.status === 'done') {
                executionEmitter.removeListener(`execution-${id}`, listener);
                stream.push(null);
            }
        };
        executionEmitter.on(`execution-${id}`, listener);
        request.raw.on('close', () => { executionEmitter.removeListener(`execution-${id}`, listener); stream.destroy(); });
        return reply
            .header('Content-Type', 'text/event-stream').header('Cache-Control', 'no-cache')
            .header('Connection', 'keep-alive').header('Access-Control-Allow-Origin', origin)
            .header('Access-Control-Allow-Credentials', 'true').send(stream);
    });

    // GET /executions - List all user/agent executions
    fastify.get<{ Querystring: { agentId: string } }>('/', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Executions'],
            summary: 'List executions',
            description: 'Returns a history of agent executions. Use `agentId` query parameter to filter by a specific agent.',
            security: [cookieAuthSecurity],
            querystring: {
                type: 'object',
                properties: {
                    agentId: { type: 'string', description: 'Filter history by specific agent ID' },
                },
            },
            response: {
                200: {
                    description: 'Execution history',
                    type: 'array',
                    items: executionSchema,
                },
                ...standardErrorResponses([401, 500]),
            },
        },
    }, async (request) => OnhandlSDKInternal.listExecutions(request.query.agentId, { userId: request.user.id, type: 'user' }));

    // POST /executions - Start a new one
    fastify.post<{ Body: { agentId: string; initialState?: any } }>(
        '/', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Executions'],
            summary: 'Create a new execution',
            description: 'Queues a new execution for the specified agent. Returns the placeholder execution record.',
            security: [cookieAuthSecurity],
            body: {
                type: 'object',
                required: ['agentId'],
                properties: {
                    agentId: { type: 'string', description: 'ID of the agent to run' },
                    initialState: { type: 'object', additionalProperties: true, description: 'Optional seed data for the agent' },
                },
            },
            response: {
                201: {
                    description: 'Execution successfully initialized',
                    ...executionSchema,
                },
                ...standardErrorResponses([401, 403, 500]),
            },
        },
    },
        async (request, reply) => {
            try {
                const execution = await OnhandlSDKInternal.startExecution(request.body.agentId, { userId: request.user.id, type: 'user' }, request.body.initialState);
                return reply.code(201).send(execution);
            } catch (err: any) { return reply.code(err.code || 500).send({ error: err.message }); }
        }
    );

    // POST /executions/simulate/node - Isolate node testing
    fastify.post<{ Body: any }>('/simulate/node', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Executions'],
            summary: 'Simulate a single node',
            description: 'Developer endpoint to test one node in isolation without running the whole flow graph.',
            security: [cookieAuthSecurity],
            body: {
                type: 'object',
                required: ['node', 'nodeType', 'inputValues'],
                properties: {
                    node: { type: 'object', additionalProperties: true, description: 'The node configuration object' },
                    nodeType: { type: 'string', description: 'Type of node (e.g., tool, chain)' },
                    inputValues: { type: 'object', additionalProperties: true, description: 'Mocked input data context' },
                    agentId: { type: 'string', description: 'Agent context' },
                },
            },
            response: {
                200: {
                    description: 'Simulation output result',
                    type: 'object',
                    required: ['success', 'output'],
                    properties: {
                        success: { type: 'boolean' },
                        output: { type: 'object', additionalProperties: true },
                        logs: { type: 'array', items: { type: 'string' } },
                    },
                },
                ...standardErrorResponses([400, 401, 500]),
            },
        },
    }, async (request, reply) => {
        try {
            return await OnhandlSDKInternal.simulateNode(request.body as any, { userId: request.user.id, type: 'user' });
        } catch (err: any) { return reply.code(err.code || 500).send({ error: err.message }); }
    });

    // POST /executions/:id/run - Trigger engine
    fastify.post<{ Params: { id: string } }>('/:id/run', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Executions'],
            summary: 'Start orchestration engine',
            description: 'Moves a "pending" execution into "running" status and begins processing the flow.',
            security: [cookieAuthSecurity],
            params: executionIdParamSchema(),
            response: {
                200: {
                    description: 'Execution triggered',
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
                ...standardErrorResponses([401, 403, 404, 500]),
            },
        },
    }, async (request, reply) => {
        try {
            await OnhandlSDKInternal.runExecution(request.params.id, { userId: request.user.id, type: 'user' });
            return { message: 'Execution started' };
        } catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
    });
}
