import { FastifyPluginAsync } from 'fastify';
import { TerminalOpsController } from './terminal-ops.controller';

export const terminalOpsRoutes: FastifyPluginAsync = async (fastify) => {
    // Apply terminal authentication to all operational routes
    fastify.addHook('onRequest', fastify.authenticateTerminal);

    // Agents
    fastify.get('/agents', TerminalOpsController.listAgents);

    // Executions
    fastify.post('/executions', TerminalOpsController.startExecution);
    fastify.get('/executions/:executionId/watch', TerminalOpsController.watchExecution);

    // Chat (Conversational Agent)
    fastify.post('/agents/:agentId/chat', TerminalOpsController.chatStream);
};
