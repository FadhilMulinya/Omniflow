import { FastifyInstance } from 'fastify';
import { OnhandlSDKInternal } from '../sdk/onhandl-sdk-internal';

export async function sdkRoutes(fastify: FastifyInstance) {
    // PROTECTED BY API KEY AUTH
    fastify.addHook('onRequest', fastify.authenticateApiKey);

    // GET /sdk/executions/:id
    fastify.get<{ Params: { id: string } }>('/executions/:id', async (request, reply) => {
        try {
            return await OnhandlSDKInternal.getExecution(request.params.id, request.apiKeyAuth!);
        } catch (e: any) {
            return reply.code(e.code || 500).send({ error: e.message });
        }
    });

    // GET /sdk/executions
    fastify.get<{ Querystring: { agentId?: string } }>('/executions', async (request) => {
        return OnhandlSDKInternal.listExecutions(request.query.agentId, request.apiKeyAuth!);
    });

    // POST /sdk/executions/start
    fastify.post<{ Body: { agentId: string; initialState?: any } }>('/executions/start', async (request, reply) => {
        const { agentId, initialState } = request.body;
        try {
            return await OnhandlSDKInternal.startExecution(agentId, request.apiKeyAuth!, initialState);
        } catch (e: any) {
            return reply.code(e.code || 500).send({ error: e.message });
        }
    });

    // POST /sdk/executions/:id/run
    fastify.post<{ Params: { id: string } }>('/executions/:id/run', async (request, reply) => {
        try {
            await OnhandlSDKInternal.runExecution(request.params.id, request.apiKeyAuth!);
            return { message: 'Execution started' };
        } catch (e: any) {
            return reply.code(e.code || 500).send({ error: e.message });
        }
    });

    // POST /sdk/executions/simulate-node
    fastify.post('/executions/simulate-node', async (request, reply) => {
        try {
            return await OnhandlSDKInternal.simulateNode(request.body as any, request.apiKeyAuth!);
        } catch (e: any) {
            return reply.code(e.code || 500).send({ error: e.message });
        }
    });
}
