import { FastifyInstance } from 'fastify';
import { ToolService } from './tools.service';
import { standardErrorResponses } from '../../shared/docs';

/**
 * ToolsController: Static discovery of available agent nodes and capabilities.
 */
export async function toolsController(fastify: FastifyInstance) {
    // GET /tools - List available primitives
    fastify.get('/', {
        schema: {
            tags: ['Tools'],
            summary: 'List available node tools',
            description: 'Returns all system-defined tools (Blockchains, LLMs, Social, Search) grouped by their category. Use these to build agent flow graphs.',
            response: {
                200: {
                    description: 'Dictionary of tools grouped by category',
                    type: 'object',
                    required: ['success', 'categories'],
                    properties: {
                        success: { type: 'boolean' },
                        categories: {
                            type: 'object',
                            description: 'Tools grouped by category ID',
                            additionalProperties: {
                                type: 'array',
                                items: { type: 'object', additionalProperties: true },
                            },
                        },
                    },
                },
                ...standardErrorResponses([500]),
            },
        },
    }, async (request, reply) => {
        try {
            const categories = await ToolService.listGrouped();
            return reply.send({ success: true, categories });
        }
        catch (error: any) {
            return reply.status(500).send({ success: false, message: 'Failed to fetch tools', error: error.message });
        }
    });
}
