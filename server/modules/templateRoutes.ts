import { FastifyInstance } from 'fastify';
import { agentTemplates } from '../lib/templates';

export const templateRoutes = async (fastify: FastifyInstance) => {
    // List all templates
    fastify.get('/templates', async (request, reply) => {
        try {
            return agentTemplates;
        } catch (err) {
            console.error('Fetch templates failed:', err);
            return reply.code(500).send({ error: 'Failed to fetch templates' });
        }
    });

    // Get a specific template
    fastify.get<{ Params: { id: string } }>('/templates/:id', async (request, reply) => {
        try {
            const template = agentTemplates.find(t => t.id === request.params.id);
            if (!template) return reply.code(404).send({ error: 'Template not found' });
            return template;
        } catch (err) {
            console.error('Fetch template failed:', err);
            return reply.code(500).send({ error: 'Failed to fetch template' });
        }
    });
};
