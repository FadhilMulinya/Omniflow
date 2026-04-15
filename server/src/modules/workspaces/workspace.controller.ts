import { FastifyInstance } from 'fastify';
import { WorkspaceService } from './workspace.service';
import type { AuthenticatedUser } from '../../shared/contracts/auth';

export async function workspaceController(fastify: FastifyInstance) {
    fastify.get(
        '/workspaces', { onRequest: [fastify.authenticate] },
        async (request) => {
            const user = request.user as AuthenticatedUser;
            return WorkspaceService.getForUser(user.id);
        }
    );

    fastify.post<{ Body: { name: string } }>(
        '/workspaces', { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            const user = request.user as AuthenticatedUser;
            try {
                const workspace = await WorkspaceService.create(user.id, request.body.name);
                return reply.code(201).send(workspace);
            } catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
        }
    );
}
