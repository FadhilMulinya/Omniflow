import { FastifyPluginAsync } from 'fastify';
import { FinancialAgentService } from '../financial-services.ts/financial-agent.service';
import {
    cookieAuthSecurity,
    standardErrorResponses,
    workspaceHeaderSchema,
} from '../../../shared/docs';
import { FINANCIAL_EVENT_TYPES, FinancialEventType } from '../../../core/financial-runtime/types';

export const financialAgentController: FastifyPluginAsync = async (fastify) => {
    fastify.post<{
        Body: {
            name: string;
            description?: string;
            subscribedEvents?: FinancialEventType[];
            permissionConfig?: Record<string, unknown>;
            approvalConfig?: Record<string, unknown>;
        }
    }>('/financial-agents', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Financial Agents'],
            summary: 'Create financial agent',
            description: 'Creates a runtime financial agent bound to workspace event subscriptions and policies.',
            security: [cookieAuthSecurity],
            headers: workspaceHeaderSchema,
            body: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    description: { type: 'string' },
                    subscribedEvents: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: FINANCIAL_EVENT_TYPES,
                        },
                    },
                    permissionConfig: { type: 'object', additionalProperties: true },
                    approvalConfig: { type: 'object', additionalProperties: true },
                },
            },
            response: {
                201: {
                    type: 'object',
                    additionalProperties: true,
                },
                ...standardErrorResponses([400, 401, 500]),
            },
        },
    }, async (request, reply) => {
        try {
            const workspaceId = request.headers['x-workspace-id'] as string;
            if (!workspaceId) return reply.code(400).send({ error: 'Missing x-workspace-id header' });
            const agent = await FinancialAgentService.createAgent({
                workspaceId,
                ...request.body,
            });
            return reply.code(201).send(agent);
        } catch (err: any) {
            return reply.code(err.code || 500).send({ error: err.message || 'Failed to create financial agent' });
        }
    });

    fastify.get('/financial-agents', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Financial Agents'],
            summary: 'List financial agents',
            description: 'Lists runtime financial agents for workspace context.',
            security: [cookieAuthSecurity],
            headers: workspaceHeaderSchema,
            response: {
                200: {
                    type: 'array',
                    items: { type: 'object', additionalProperties: true },
                },
                ...standardErrorResponses([400, 401, 500]),
            },
        },
    }, async (request, reply) => {
        const workspaceId = request.headers['x-workspace-id'] as string;
        if (!workspaceId) return reply.code(400).send({ error: 'Missing x-workspace-id header' });
        return FinancialAgentService.listAgents(workspaceId);
    });

    fastify.get<{ Params: { id: string } }>('/financial-agents/:id', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Financial Agents'],
            summary: 'Get financial agent',
            description: 'Returns financial runtime agent detail with current state.',
            security: [cookieAuthSecurity],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string' } },
            },
            response: {
                200: { type: 'object', additionalProperties: true },
                ...standardErrorResponses([401, 404, 500]),
            },
        },
    }, async (request, reply) => {
        const agent = await FinancialAgentService.getAgent(request.params.id);
        if (!agent) return reply.code(404).send({ error: 'Financial agent not found' });
        return agent;
    });

    fastify.post<{ Params: { id: string } }>('/financial-agents/:id/pause', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Financial Agents'],
            summary: 'Pause financial agent',
            description: 'Pauses event processing for a financial agent.',
            security: [cookieAuthSecurity],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string' } },
            },
            response: {
                200: { type: 'object', additionalProperties: true },
                ...standardErrorResponses([401, 404, 500]),
            },
        },
    }, async (request, reply) => {
        const updated = await FinancialAgentService.pauseAgent(request.params.id);
        if (!updated) return reply.code(404).send({ error: 'Financial agent not found' });
        return updated;
    });

    fastify.post<{ Params: { id: string } }>('/financial-agents/:id/activate', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Financial Agents'],
            summary: 'Activate financial agent',
            description: 'Activates event processing for a financial agent.',
            security: [cookieAuthSecurity],
            params: {
                type: 'object',
                required: ['id'],
                properties: { id: { type: 'string' } },
            },
            response: {
                200: { type: 'object', additionalProperties: true },
                ...standardErrorResponses([401, 404, 500]),
            },
        },
    }, async (request, reply) => {
        const updated = await FinancialAgentService.activateAgent(request.params.id);
        if (!updated) return reply.code(404).send({ error: 'Financial agent not found' });
        return updated;
    });
};
