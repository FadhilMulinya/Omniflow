import { FastifyPluginAsync } from 'fastify';
import { agentRoutes } from './agent.controller';

const agentsModuleRoutes: FastifyPluginAsync = async (app) => {
    app.register(agentRoutes);
};

// Named export for backward compat with api/routes/index.ts
export { agentRoutes };
