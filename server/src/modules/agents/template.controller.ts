import { FastifyInstance } from 'fastify';
import { AgentTemplateService } from './agent-template.service';

export async function templatesController(fastify: FastifyInstance) {
    fastify.get('/', async (_request, reply) => {
        try { return AgentTemplateService.listTemplates(); }
        catch (err) { console.error('Fetch templates failed:', err); return reply.code(500).send({ error: 'Failed to fetch templates' }); }
    });

    fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
        try {
            const template = AgentTemplateService.getTemplateById(request.params.id);
            if (!template) return reply.code(404).send({ error: 'Template not found' });
            return template;
        } catch (err) {
            console.error('Fetch template failed:', err);
            return reply.code(500).send({ error: 'Failed to fetch template' });
        }
    });
}
