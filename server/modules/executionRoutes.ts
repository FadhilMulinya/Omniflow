import { FastifyPluginAsync } from 'fastify';
import { ExecutionRun } from '../models/ExecutionRun';
import { eventBus } from '../lib/eventBus';

export const executionRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get<{ Querystring: { agentId: string } }>('/executions', async (request, reply) => {
        const { agentId } = request.query;
        const filter = agentId ? { agentDefinitionId: agentId } : {};
        const executions = await ExecutionRun.find(filter);
        return executions;
    });

    fastify.post<{ Body: { agentId: string; triggeredBy?: string; initialState?: any } }>(
        '/executions',
        async (request, reply) => {
            const { agentId, triggeredBy, initialState } = request.body;
            const execution = new ExecutionRun({
                agentDefinitionId: agentId,
                triggeredBy,
                state: initialState || {},
                status: 'pending',
            });
            await execution.save();

            // Emit event
            eventBus.emit('agent.run.started', { executionId: execution._id, agentId });

            return reply.code(201).send(execution);
        }
    );
};
