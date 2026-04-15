import { FastifyInstance } from 'fastify';
import { DeveloperApiKeyService } from './developer-api-key.service';
import { Workspace } from '../../infrastructure/database/models/Workspace';

export async function developerApiKeyController(fastify: FastifyInstance) {
    // GET /api/developer/keys — list my keys
    fastify.get('/keys', { onRequest: [fastify.authenticate] }, async (request) => {
        return DeveloperApiKeyService.listKeys(request.user.id);
    });

    // POST /api/developer/keys — create a new key
    fastify.post<{ Body: { name: string } }>(
        '/keys',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const workspace = await Workspace.findOne({ ownerId: request.user.id });
            if (!workspace) return reply.code(404).send({ error: 'Workspace not found' });

            const result = await DeveloperApiKeyService.createApiKey(
                request.user.id,
                String(workspace._id),
                request.body.name || 'Default Key'
            );
            return reply.code(201).send(result);
        }
    );

    // DELETE /api/developer/keys/:id — revoke a key
    fastify.delete<{ Params: { id: string } }>(
        '/keys/:id',
        { onRequest: [fastify.authenticate] },
        async (request) => {
            await DeveloperApiKeyService.revokeKey(request.params.id, request.user.id);
            return { success: true };
        }
    );
}
