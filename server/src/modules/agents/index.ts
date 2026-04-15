import { FastifyPluginAsync } from 'fastify';
import { agentRoutes } from './agent.controller';
import { exportRoutes } from './agent-export.controller';
import { templatesController } from './template.controller';

export const agentsModuleRoutes: FastifyPluginAsync = async (app) => {
    app.register(agentRoutes);
    app.register(exportRoutes);
    app.register(templatesController, { prefix: '/agent-templates' });
};

// Named export for backward compat with api/routes/index.ts
export { agentRoutes };
