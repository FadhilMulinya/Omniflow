import { FastifyInstance } from 'fastify';
import { DeveloperApiKeyService } from './developer-api-key.service';

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
            try {
                const result = await DeveloperApiKeyService.createApiKeyForUser(
                    request.user.id,
                    request.body.name || 'Default Key'
                );
                return reply.code(201).send(result);
            } catch (err: any) {
                return reply.code(err.code || 500).send({ error: err.message });
            }
        }
    );

    // DELETE /api/developer/keys/:id — revoke a key
    fastify.delete<{ Params: { id: string } }>(
        '/keys/:id',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                await DeveloperApiKeyService.revokeKey(request.params.id, request.user.id);
                return { success: true };
            } catch (err: any) {
                return reply.code(err.code || 500).send({ error: err.message });
            }
        }
    );
}
