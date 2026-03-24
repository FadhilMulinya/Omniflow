import { FastifyPluginAsync } from 'fastify';
import { Workspace } from '../models/Workspace';

export const workspaceRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/workspaces', async (request, reply) => {
        const workspaces = await Workspace.find({}).populate('ownerId');
        return workspaces;
    });

    fastify.post<{ Body: { name: string; ownerId: string } }>(
        '/workspaces',
        async (request, reply) => {
            const { name, ownerId } = request.body;
            const workspace = new Workspace({ name, ownerId });
            await workspace.save();
            return reply.code(201).send(workspace);
        }
    );
};
