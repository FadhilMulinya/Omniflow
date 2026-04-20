import { FastifyInstance } from 'fastify';

import { authRoutes } from '../../modules/auth';
import { terminalAuthRoutes } from '../../modules/terminal-auth';
import { terminalOpsRoutes } from '../../modules/terminal-ops';
import { userRoutes } from '../../modules/users';
import { workspaceRoutes } from '../../modules/workspaces';
import { agentRoutes } from '../../modules/agents';
import { executionRoutes } from '../../modules/executions';
import { toolRoutes } from '../../modules/tools';
import { paymentRoutes } from '../../modules/payments';
import { marketplaceRoutes } from '../../modules/marketplace';
import { supportRoutes } from '../../modules/support';
import { adminRoutes } from '../../modules/admin';
import { blogRoutes } from '../../modules/blog';
import { reviewRoutes } from '../../modules/reviews';
import { botRoutes } from '../../modules/bots';
import { aiRoutes } from '../../modules/ai';
import { developerApiKeyController } from '../../modules/developer-api-keys/developer-api-key.controller';
import { sdkRoutes } from '../../modules/sdk/sdk.controller';

export async function registerRoutes(app: FastifyInstance) {
    app.register(authRoutes, { prefix: '/auth' });
    app.register(terminalAuthRoutes, { prefix: '/terminal/auth' });
    app.register(terminalOpsRoutes, { prefix: '/terminal/ops' });
    app.register(userRoutes, { prefix: '/users' });
    app.register(workspaceRoutes, { prefix: '/workspaces' });
    app.register(agentRoutes, { prefix: '/agents' });
    app.register(executionRoutes, { prefix: '/executions' });
    app.register(toolRoutes, { prefix: '/tools' });
    app.register(paymentRoutes, { prefix: '/payments' });
    app.register(marketplaceRoutes, { prefix: '/marketplace' });
    app.register(supportRoutes, { prefix: '/support' });
    app.register(adminRoutes, { prefix: '/admin' });
    app.register(blogRoutes, { prefix: '/blog' });
    app.register(reviewRoutes, { prefix: '/reviews' }); /* was on /agents/:id/reviews */
    app.register(botRoutes, { prefix: '/bots' }); /* replaces /bot and /telegram */
    app.register(aiRoutes, { prefix: '/ai' });
    app.register(developerApiKeyController, { prefix: '/developer' });
    app.register(sdkRoutes, { prefix: '/sdk' });
}
