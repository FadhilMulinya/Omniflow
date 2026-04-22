import { FastifyPluginAsync } from 'fastify';
import {
    listAgents, getAgentWithGraph, getAgentCharacter, getPlanStatus, updateAgent, deleteAgent,
} from './agent.service';
import { AgentCreationService } from './services/agent-creation.service';
import {
    cookieAuthSecurity,
    agentIdParamSchema,
    agentSchema,
    standardErrorResponses,
} from '../../shared/docs';

const readAgentRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get<{ Querystring: { isDraft?: string; status?: string; search?: string } }>(
        '/agents', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'List my agents',
            description: 'Returns all agents owned by the authenticated user. Supports searching by name and filtering by status.',
            security: [cookieAuthSecurity],
            querystring: {
                type: 'object',
                properties: {
                    isDraft: { type: 'string', enum: ['true', 'false'] },
                    status: { type: 'string', enum: ['published', 'drafts', 'listed'] },
                    search: { type: 'string' },
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

    fastify.get('/agents/plan-status', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Get plan status',
            description: 'Returns the current user plan details and capacity.',
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

    fastify.get<{ Params: { id: string } }>('/agents/:id', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Get agent by ID',
            description: 'Returns an agent with its full configuration and identities.',
            security: [cookieAuthSecurity],
            params: agentIdParamSchema(),
            response: {
                200: {
                    description: 'Agent details',
                    ...agentSchema,
                    properties: {
                        ...agentSchema.properties,
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

    fastify.get<{ Params: { id: string } }>('/agents/:id.json', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Export agent character (JSON)',
            description: 'Returns the agent character in portable JSON format.',
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

const createAgentRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post<{ Body: { name: string; persona: string; agentType?: string; chains?: string[] } }>(
        '/agents/enhance', {
        schema: {
            tags: ['Agents'],
            summary: 'Preview enhanced persona',
            description: 'Uses an LLM to refine and expand a raw agent concept into a polished persona.',
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

    fastify.post<{ Body: { name: string; description?: string; persona?: string; identities?: any; character?: any; isDraft?: boolean; agentType?: string; chains?: string[] } }>(
        '/agents', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Create a new agent',
            description: 'Initializes a new AI agent.',
            security: [cookieAuthSecurity],
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    description: { type: 'string' },
                    persona: { type: 'string' },
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
};

const updateAgentRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.put<{ Params: { id: string }; Body: { name?: string; description?: string; persona?: string; identities?: any; character?: any; isDraft?: boolean; provider?: string; apiKey?: string; model?: string; agentType?: string } }>(
        '/agents/:id', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Update an agent',
            description: 'Modifies an existing agent configuration and persona.',
            security: [cookieAuthSecurity],
            params: agentIdParamSchema(),
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    persona: { type: 'string' },
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

    fastify.delete<{ Params: { id: string } }>('/agents/:id', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Agents'],
            summary: 'Delete an agent',
            description: 'Deletes an agent.',
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
            return { message: 'Agent deleted successfully' };
        } catch (err: any) { return reply.code(err.code || 500).send({ error: err.message || 'Failed to delete agent' }); }
    });
};

export const agentRoutes: FastifyPluginAsync = async (app) => {
    app.register(readAgentRoutes);
    app.register(createAgentRoutes);
    app.register(updateAgentRoutes);
};
