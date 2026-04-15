import { FastifyInstance } from 'fastify';
import { Readable } from 'stream';
import { executionEmitter } from './execution.events';
import { OnhandlSDKInternal } from '../../sdk/onhandl-sdk-internal';

export async function executionController(fastify: FastifyInstance) {
    // ── Get execution ──────────────────────────────────────────────────────────
    fastify.get<{ Params: { id: string } }>('/:id', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            return await OnhandlSDKInternal.getExecution(request.params.id, {
                userId: request.user.id,
                type: 'user',
            });
        } catch (err: any) {
            return reply.code(err.code || 500).send({ error: err.message });
        }
    });

    // ── SSE stream ────────────────────────────────────────────────────────────
    fastify.get<{ Params: { id: string } }>('/:id/stream', (request, reply) => {
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
        request.raw.on('close', () => {
            executionEmitter.removeListener(`execution-${id}`, listener);
            stream.destroy();
        });

        return reply
            .header('Content-Type', 'text/event-stream')
            .header('Cache-Control', 'no-cache')
            .header('Connection', 'keep-alive')
            .header('Access-Control-Allow-Origin', origin)
            .header('Access-Control-Allow-Credentials', 'true')
            .send(stream);
    });

    // ── List executions ────────────────────────────────────────────────────────
    fastify.get<{ Querystring: { agentId: string } }>('/', { onRequest: [fastify.authenticate] }, async (request) => {
        return OnhandlSDKInternal.listExecutions(request.query.agentId, {
            userId: request.user.id,
            type: 'user',
        });
    });

    // ── Start execution ────────────────────────────────────────────────────────
    fastify.post<{ Body: { agentId: string; initialState?: any } }>(
        '/',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const { agentId, initialState } = request.body;
            try {
                const execution = await OnhandlSDKInternal.startExecution(agentId, {
                    userId: request.user.id,
                    type: 'user',
                }, initialState);
                return reply.code(201).send(execution);
            } catch (err: any) {
                return reply.code(err.code || 500).send({ error: err.message });
            }
        }
    );

    // ── Node simulation ────────────────────────────────────────────────────────
    fastify.post<{ Body: any }>(
        '/simulate/node',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                return await OnhandlSDKInternal.simulateNode(request.body as any, {
                    userId: request.user.id,
                    type: 'user',
                });
            } catch (err: any) {
                return reply.code(err.code || 500).send({ error: err.message });
            }
        }
    );

    // ── Run execution ────────────────────────────────────────────────────────
    fastify.post<{ Params: { id: string } }>('/:id/run', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        try {
            await OnhandlSDKInternal.runExecution(request.params.id, {
                userId: request.user.id,
                type: 'user',
            });
            return { message: 'Execution started' };
        } catch (e: any) {
            return reply.code(e.code || 500).send({ error: e.message });
        }
    });
}
