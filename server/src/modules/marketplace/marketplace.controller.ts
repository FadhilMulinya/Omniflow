import { FastifyInstance } from 'fastify';
import { MarketplaceService } from './marketplace.service';
import {
    cookieAuthSecurity,
    idParamSchema,
    paginatedSearchQuerySchema,
    standardErrorResponses,
    marketplaceAgentSchema,
    marketplaceListingSchema,
} from '../../shared/docs';

/**
 * MarketplaceController: Public endpoints for browsing, searching, and publishing
 * agents to the community marketplace.
 */
export const marketplaceRoutes = async (fastify: FastifyInstance) => {

    // GET /marketplace - List and search agents
    fastify.get<{ Querystring: { category?: string; pricing?: string; network?: string; search?: string; page?: string; limit?: string } }>('/marketplace', {
        schema: {
            tags: ['Marketplace'],
            summary: 'List published marketplace agents',
            description: 'Returns a paginated list of publicly published agents. Includes creator info and marketplace stats.',
            querystring: {
                type: 'object',
                properties: {
                    ...paginatedSearchQuerySchema.properties,
                    category: { type: 'string', description: 'Filter by category (e.g., DeFi, Tools, Custom)' },
                    pricing: { type: 'string', enum: ['free', 'paid', 'all'], default: 'all' },
                    network: { type: 'string', description: 'Filter by blockchain network' },
                },
            },
            response: {
                200: {
                    description: 'Paginated marketplace agents',
                    type: 'object',
                    required: ['agents', 'total', 'page', 'limit'],
                    properties: {
                        agents: { type: 'array', items: marketplaceAgentSchema },
                        total: { type: 'number' },
                        page: { type: 'number' },
                        limit: { type: 'number' },
                    },
                },
                ...standardErrorResponses([500]),
            },
        },
    }, async (request) => MarketplaceService.listAgents(request.query as any));

    // GET /marketplace/:id - Get detail view
    fastify.get<{ Params: { id: string } }>('/marketplace/:id', {
        schema: {
            tags: ['Marketplace'],
            summary: 'Get marketplace agent details',
            description: 'Returns full details for a published marketplace agent. Also increments the agent\'s view counter.',
            params: idParamSchema('Agent ID'),
            response: {
                200: {
                    description: 'Full agent details',
                    ...marketplaceAgentSchema,
                },
                ...standardErrorResponses([404, 500]),
            },
        },
    }, async (request, reply) => {
        try { return await MarketplaceService.getAgent(request.params.id); }
        catch (err: any) { return reply.code(err.code || 500).send({ error: err.message }); }
    });

    // POST /marketplace/:id/publish - User lists their agent
    fastify.post<{ Params: { id: string }; Body: any }>(
        '/marketplace/:id/publish', {
        onRequest: [fastify.authenticate],
        schema: {
            tags: ['Marketplace'],
            summary: 'Publish agent to marketplace',
            description: 'Creates or updates a public marketplace listing for an agent. Requires an active plan.',
            security: [cookieAuthSecurity],
            params: idParamSchema('Agent ID'),
            body: {
                ...marketplaceListingSchema,
                description: 'Configuration for the marketplace listing.',
            },
            response: {
                200: {
                    description: 'Listing successfully updated',
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        agent: marketplaceAgentSchema,
                    },
                },
                ...standardErrorResponses([400, 401, 403, 500]),
            },
        },
    },
        async (request, reply) => {
            try { return await MarketplaceService.publishListing(request.params.id, request.user.id, request.body); }
            catch (err: any) { return reply.code(err.code || 500).send({ error: err.message }); }
        }
    );
}
