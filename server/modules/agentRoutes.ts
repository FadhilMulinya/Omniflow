import { FastifyPluginAsync } from 'fastify';
import { AgentDefinition } from '../models/AgentDefinition';
import { Workspace } from '../models/Workspace';

export const agentRoutes: FastifyPluginAsync = async (fastify) => {
    // Get all agents for the authenticated user's workspace
    fastify.get('/agents', async (request, reply) => {
        try {
            const token = request.cookies['auth_token'];
            if (!token) return reply.code(401).send({ error: 'Unauthorized' });

            const decoded = fastify.jwt.verify(token) as any;

            // Find user's workspace (for now we assume the first one)
            let workspace = await Workspace.findOne({ ownerId: decoded.id });

            // Migration: Create a default workspace if none exists
            if (!workspace) {
                workspace = new Workspace({
                    name: `Default Workspace`,
                    ownerId: decoded.id,
                    members: [decoded.id]
                });
                await workspace.save();
            }

            const agents = await AgentDefinition.find({ workspaceId: workspace._id });
            return agents;
        } catch (err) {
            return reply.code(401).send({ error: 'Invalid token' });
        }
    });

    // Create a new agent
    fastify.post<{ Body: { name: string; description?: string; graph: any } }>(
        '/agents',
        async (request, reply) => {
            try {
                const token = request.cookies['auth_token'];
                if (!token) return reply.code(401).send({ error: 'Unauthorized' });

                const decoded = fastify.jwt.verify(token) as any;
                const { name, description, graph } = request.body;

                // Find user's workspace
                const workspace = await Workspace.findOne({ ownerId: decoded.id });
                if (!workspace) return reply.code(404).send({ error: 'No workspace found for user' });

                const agent = new AgentDefinition({
                    ownerId: decoded.id,
                    workspaceId: workspace._id,
                    name,
                    description,
                    graph
                });

                await agent.save();
                return reply.code(201).send(agent);
            } catch (err) {
                return reply.code(401).send({ error: 'Invalid token' });
            }
        }
    );
};
