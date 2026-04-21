import { FastifyPluginAsync } from 'fastify';
import { Readable } from 'stream';
import { Orchestrator } from '../../core/engine/orchestrator';
import {
    listAgents, getAgentWithGraph, getAgentCharacter, getPlanStatus, updateAgent, deleteAgent,
} from './agent.service';
import { AgentCreationService } from './services/agent-creation.service';
import {
    cookieAuthSecurity,
    idParamSchema,
    agentIdParamSchema,
    agentSchema,
    standardErrorResponses,
} from '../../shared/docs';

/**
 * Agent READ Endpoints
 */
export const readAgentRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /agents - List my agents
    fastify.get<{ Querystring: { isDraft?: string; status?: string; search?: string } }>(
        '/agents', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'List my agents',
            description: 'Returns all agents owned by the authenticated user. Supports searching by name and filtering by status (drafts, published, listed).',
            security: [cookieAuthSecurity],
            querystring: {
                type: 'object',
                properties: {
                    isDraft: { type: 'string', enum: ['true', 'false'], description: 'Legacy draft filter' },
                    status: { type: 'string', enum: ['published', 'drafts', 'listed'], description: 'Filter agents by their current lifecycle status' },
                    search: { type: 'string', description: 'Search agents by name or description' },
                },
            },
            response: {
                200: {
                    description: 'List of user agents',
                    type: 'array',
                    items: agentSchema,
                },
                ...standardErrorResponses([401, 500]),
            },
        },
    },
        async (request) => listAgents(request.user.id, request.query)
    );

    // GET /agents/plan-status - User capability check
    fastify.get('/agents/plan-status', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Get plan status',
            description: 'Returns the current user\'s plan details, including agent limits and remaining capacity.',
            security: [cookieAuthSecurity],
            response: {
                200: {
                    description: 'Plan and limit status',
                    type: 'object',
                    properties: {
                        plan: { type: 'string' },
                        tokens: { type: 'number' },
                        agentLimit: { type: 'number' },
                        agentCount: { type: 'number' },
                        atLimit: { type: 'boolean' },
                        canCreate: { type: 'boolean' },
                        canDelete: { type: 'boolean' },
                        canReEdit: { type: 'boolean' },
                    },
                },
                ...standardErrorResponses([401, 500]),
            },
        },
    }, async (request, reply) => {
        try { return await getPlanStatus(request.user.id); }
        catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
    });

    // GET /agents/:id - Get detail (with graph)
    fastify.get<{ Params: { id: string } }>('/agents/:id', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Get agent by ID',
            description: 'Returns an agent with its full configuration, identities, and visual graph definition.',
            security: [cookieAuthSecurity],
            params: agentIdParamSchema(),
            response: {
                200: {
                    description: 'Agent details with full graph',
                    ...agentSchema,
                    properties: {
                        ...agentSchema.properties,
                        graph: { type: 'object', additionalProperties: true },
                        identities: { type: 'object', additionalProperties: true },
                        character: { type: 'object', additionalProperties: true },
                    },
                },
                ...standardErrorResponses([401, 404, 500]),
            },
        },
    }, async (request, reply) => {
        const result = await getAgentWithGraph(request.params.id);
        if (!result) return reply.code(404).send({ error: 'Agent not found' });
        return result;
    });

    // GET /agents/:id.json - Exported character format
    fastify.get<{ Params: { id: string } }>('/agents/:id.json', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Export agent character (JSON)',
            description: 'Returns the agent in a portable JSON format compatible with external executors.',
            security: [cookieAuthSecurity],
            params: agentIdParamSchema(),
            response: {
                200: {
                    description: 'Portable agent character JSON',
                    type: 'object',
                    properties: {
                        agentId: { type: 'string' },
                        name: { type: 'string' },
                        persona: { type: 'string' },
                        character: { type: 'object', additionalProperties: true },
                    },
                },
                ...standardErrorResponses([401, 404, 500]),
            },
        },
    }, async (request, reply) => {
        const character = await getAgentCharacter(request.params.id);
        if (!character) return reply.code(404).send({ error: 'Agent not found' });
        return character;
    });
};

/**
 * Agent CREATE Endpoints
 */
export const createAgentRoutes: FastifyPluginAsync = async (fastify) => {
    // POST /agents/enhance - AI-powered persona refining
    fastify.post<{ Body: { name: string; persona: string; agentType?: string; chains?: string[] } }>(
        '/agents/enhance', {
        schema: {
            tags: ['Agents'],
            summary: 'Preview enhanced persona',
            description: 'Uses an LLM to refine and expand a raw agent concept into a polished persona. Does not persist the agent.',
            body: {
                type: 'object',
                required: ['name', 'persona'],
                properties: {
                    name: { type: 'string' },
                    persona: { type: 'string' },
                    agentType: { type: 'string', enum: ['operational_agent', 'browser_agent'], default: 'operational_agent' },
                    chains: { type: 'array', items: { type: 'string' } },
                },
            },
            response: {
                200: {
                    description: 'Enhanced persona draft',
                    type: 'object',
                    properties: {
                        enhancedPersona: { type: 'string' },
                        suggestedChains: { type: 'array', items: { type: 'string' } },
                        identity: { type: 'object', additionalProperties: true },
                        character: { type: 'object', additionalProperties: true },
                    }
                },
                ...standardErrorResponses([400, 500]),
            },
        },
    },
        async (request, reply) => {
            try {
                const { name, persona, agentType = 'operational_agent', chains = [] } = request.body;
                if (!name || !persona) return reply.code(400).send({ error: 'Name and Persona are required' });
                return await AgentCreationService.previewEnhancePersona(name, persona, agentType, chains, request.user?.id);
            } catch (err: any) { return reply.code(500).send({ error: err.message }); }
        }
    );

    // POST /agents - Core agent creation
    fastify.post<{ Body: { name: string; description?: string; persona?: string; graph?: any; identities?: any; character?: any; isDraft?: boolean; agentType?: string; chains?: string[] } }>(
        '/agents', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Create a new agent',
            description: 'Initializes a new AI agent. Requires Starter plan or better for non-draft agents.',
            security: [cookieAuthSecurity],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    description: { type: 'string' },
                    persona: { type: 'string' },
                    graph: { type: 'object', additionalProperties: true },
                    identities: { type: 'object', additionalProperties: true },
                    character: { type: 'object', additionalProperties: true },
                    isDraft: { type: 'boolean', default: false },
                    agentType: { type: 'string', enum: ['operational_agent', 'browser_agent'], default: 'operational_agent' },
                    chains: { type: 'array', items: { type: 'string' } },
                },
            },
            response: {
                201: {
                    description: 'Agent successfully created',
                    ...agentSchema,
                },
                ...standardErrorResponses([400, 401, 403, 500]),
            },
        },
    },
        async (request, reply) => {
            try {
                const agent = await AgentCreationService.createAgent({ userId: request.user.id, ...request.body, log: (msg) => request.log.error(msg) });
                return reply.code(201).send(agent);
            } catch (err: any) { return reply.code(err.code || 500).send({ error: err.message || 'Internal server error', details: err.details }); }
        }
    );

    // POST /agents/from-template - Template-based creation
    fastify.post<{ Body: { templateId: string; name: string } }>(
        '/agents/from-template', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Create agent from template',
            description: 'Clones an agent from a pre-defined library template.',
            security: [cookieAuthSecurity],
            body: {
                type: 'object',
                required: ['templateId', 'name'],
                properties: {
                    templateId: { type: 'string' },
                    name: { type: 'string' },
                },
            },
            response: {
                200: {
                    description: 'Template instantiated successfully',
                    ...agentSchema,
                },
                ...standardErrorResponses([401, 403, 404, 500]),
            },
        },
    },
        async (request, reply) => {
            try { return await AgentCreationService.createAgentFromTemplate(request.user.id, request.body.templateId, request.body.name); }
            catch (err: any) { return reply.code(err.code || 500).send({ error: err.message || 'Failed to create agent from template' }); }
        }
    );
};

/**
 * Agent UPDATE / DELETE / QUERY Endpoints
 */
export const updateAgentRoutes: FastifyPluginAsync = async (fastify) => {
    // PUT /agents/:id - General update
    fastify.put<{ Params: { id: string }; Body: { name?: string; description?: string; persona?: string; graph?: any; identities?: any; character?: any; isDraft?: boolean; provider?: string; apiKey?: string; model?: string; agentType?: string } }>(
        '/agents/:id', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Update an agent',
            description: 'Modifies an existing agent\'s configuration or graph. Triggers AI re-enhancement if the persona changes significantly.',
            security: [cookieAuthSecurity],
            params: agentIdParamSchema(),
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    persona: { type: 'string' },
                    graph: { type: 'object', additionalProperties: true },
                    identities: { type: 'object', additionalProperties: true },
                    character: { type: 'object', additionalProperties: true },
                    isDraft: { type: 'boolean' },
                    agentType: { type: 'string', enum: ['operational_agent', 'browser_agent'] },
                },
            },
            response: {
                200: {
                    description: 'Agent updated',
                    ...agentSchema,
                },
                ...standardErrorResponses([400, 401, 403, 404, 500]),
            },
        },
    },
        async (request, reply) => {
            try { return await updateAgent({ id: request.params.id, userId: request.user.id, ...request.body, log: (msg) => request.log.error(msg) }); }
            catch (err: any) { return reply.code(err.code || 500).send({ error: err.message || 'Failed to update agent', details: err.details }); }
        }
    );

    // DELETE /agents/:id - Soft or hard deletion
    fastify.delete<{ Params: { id: string } }>('/agents/:id', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Delete an agent',
            description: 'Deletes an agent and its associated graph. Requires a paid plan to perform deletions.',
            security: [cookieAuthSecurity],
            params: agentIdParamSchema(),
            response: {
                200: {
                    description: 'Agent deleted',
                    type: 'object',
                    properties: { message: { type: 'string' } },
                },
                ...standardErrorResponses([401, 403, 404, 500]),
            },
        },
    }, async (request, reply) => {
        try {
            await deleteAgent(request.params.id, request.user.id);
            return { message: 'Agent and associated data deleted successfully' };
        } catch (err: any) { return reply.code(err.code || 500).send({ error: err.message || 'Failed to delete agent' }); }
    });

    // POST /agent/query - Interactive Chat (SSE)
    fastify.post<{ Body: { prompt: string; agentId: string; sessionId: string } }>(
        '/agent/query', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Query agent (SSE chat)',
            description: 'Establishes a Server-Sent Events stream for real-time agent interaction. Streams JSON events for content, tool usage, and completion.',
            security: [cookieAuthSecurity],
            body: {
                type: 'object',
                required: ['prompt', 'agentId', 'sessionId'],
                properties: {
                    prompt: { type: 'string', description: 'User input text' },
                    agentId: { type: 'string' },
                    sessionId: { type: 'string', description: 'Chat session identifier for memory persistence' },
                },
            },
            response: {
                200: {
                    description: 'Event stream',
                    type: 'string',
                    content: { 'text/event-stream': { schema: { type: 'string' } } },
                },
                ...standardErrorResponses([401, 404, 500]),
            },
        },
    },
        async (request, reply) => {
            const { prompt, agentId, sessionId } = request.body;
            const userId = request.user.id;
            try {
                const readable = new Readable({ read() { } });
                Orchestrator.handleQuery(prompt, agentId, userId, sessionId, readable)
                    .then(() => readable.push(null))
                    .catch((err) => { readable.push(`data: ${JSON.stringify({ error: err.message })}\n\n`); readable.push(null); });
                return reply
                    .header('Content-Type', 'text/event-stream').header('Cache-Control', 'no-cache')
                    .header('Connection', 'keep-alive')
                    .header('Access-Control-Allow-Origin', request.headers.origin || 'http://localhost:3000')
                    .header('Access-Control-Allow-Credentials', 'true').send(readable);
            } catch (error: any) { return reply.code(500).send({ error: error.message }); }
        }
    );
};

/**
 * Module entry
 */
export const agentRoutes: FastifyPluginAsync = async (app) => {
    app.register(readAgentRoutes);
    app.register(createAgentRoutes);
    app.register(updateAgentRoutes);
};
