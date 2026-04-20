import { FastifyInstance } from 'fastify';
import { TerminalAuthService } from './terminal-auth.service';
import { standardErrorResponses } from '../../shared/docs';

export async function terminalAuthController(fastify: FastifyInstance) {
    // POST /terminal/auth/start - classic start
    fastify.post('/start', async (request, reply) => {
        console.log('[TerminalAuth] POST /start hit - body:', request.body);
        try {
            const session = await TerminalAuthService.startLoginSession();
            return reply.send(session);
        } catch (e: any) {
            console.error('[TerminalAuth] POST /start error:', e);
            return reply.code(500).send({ error: e.message });
        }
    });

    // GET /terminal/auth/start - for simple terminal clients or if body is an issue
    fastify.get('/start', async (_request, reply) => {
        console.log('[TerminalAuth] GET /start hit');
        try {
            const session = await TerminalAuthService.startLoginSession();
            return reply.send(session);
        } catch (e: any) {
            console.error('[TerminalAuth] GET /start error:', e);
            return reply.code(500).send({ error: e.message });
        }
    });

    // GET /terminal/auth/approve?userCode=... - redirect browser to frontend
    fastify.get<{ Querystring: { userCode: string } }>(
        '/approve',
        async (request, reply) => {
            const { userCode } = request.query;
            console.log('[TerminalAuth] GET /approve hit - userCode:', userCode);
            const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/api$/, '');
            const url = `${appUrl}/terminal/approve?userCode=${userCode}`;
            console.log('[TerminalAuth] Redirecting to:', url);
            return reply.redirect(url);
        }
    );

    // GET version of /start for easy testing/fallback
    fastify.get('/start', async (_request, reply) => {
        const session = await TerminalAuthService.startLoginSession();
        return reply.send(session);
    });

    // GET /approve?userCode=... redirects to frontend
    fastify.get<{ Querystring: { userCode: string } }>(
        '/approve',
        async (request, reply) => {
            const { userCode } = request.query;
            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            return reply.redirect(`${appUrl}/terminal/approve?userCode=${userCode}`);
        }
    );

    fastify.post<{ Body: { deviceCode: string } }>(
        '/poll',
        {
            schema: {
                tags: ['Terminal Auth'],
                summary: 'Poll terminal login session',
                description: 'Used by the terminal to poll session status. Needs deviceCode.',
                body: {
                    type: 'object',
                    required: ['deviceCode'],
                    properties: {
                        deviceCode: { type: 'string' },
                    },
                },
                response: {
                    ...standardErrorResponses([400, 500]),
                },
            },
        },
        async (request, reply) => {
            const { deviceCode } = request.body;
            if (!deviceCode) return reply.code(400).send({ error: 'deviceCode is required' });

            try {
                const status = await TerminalAuthService.pollSession(deviceCode);
                return reply.send(status);
            } catch (e: any) {
                return reply.code(400).send({ error: e.message });
            }
        }
    );

    fastify.post<{ Body: { deviceCode: string } }>(
        '/logout',
        {
            schema: {
                tags: ['Terminal Auth'],
                summary: 'Terminal logout',
                body: {
                    type: 'object',
                    required: ['deviceCode'],
                    properties: {
                        deviceCode: { type: 'string' },
                    },
                },
            },
        },
        async (request, reply) => {
            const { deviceCode } = request.body;
            if (deviceCode) {
                await TerminalAuthService.logout(deviceCode);
            }
            return reply.send({ success: true, message: 'Logged out' });
        }
    );

    // Endpoint for browser to approve (should be authenticated!)
    fastify.post<{ Body: { userCode: string; workspaceId: string } }>(
        '/approve',
        {
            onRequest: [fastify.authenticate],
            schema: {
                tags: ['Terminal Auth'],
                summary: 'Approve terminal session',
                description: 'Called by the web frontend once the user authorizes the terminal session.',
                body: {
                    type: 'object',
                    required: ['userCode', 'workspaceId'],
                    properties: {
                        userCode: { type: 'string' },
                        workspaceId: { type: 'string' }
                    }
                }
            }
        },
        async (request, reply) => {
            const { userCode, workspaceId } = request.body;
            try {
                const deviceName = 'Onhandl Terminal CLI';
                await TerminalAuthService.approveSession(userCode, request.user.id, workspaceId, deviceName);
                return reply.send({ success: true });
            } catch (e: any) {
                return reply.code(400).send({ error: e.message });
            }
        }
    );

    // Get active terminal sessions for the user
    fastify.get(
        '/sessions',
        {
            onRequest: [fastify.authenticate],
            schema: {
                tags: ['Terminal Auth'],
                summary: 'List active terminal sessions',
                response: {
                    ...standardErrorResponses([401, 500])
                }
            }
        },
        async (request, reply) => {
            try {
                const sessions = await TerminalAuthService.getSessions(request.user.id);
                return reply.send({ sessions });
            } catch (e: any) {
                return reply.code(500).send({ error: e.message });
            }
        }
    );

    // Revoke a specific terminal session securely
    fastify.delete<{ Params: { id: string } }>(
        '/sessions/:id',
        {
            onRequest: [fastify.authenticate],
            schema: {
                tags: ['Terminal Auth'],
                summary: 'Revoke a terminal session',
                params: {
                    type: 'object',
                    required: ['id'],
                    properties: {
                        id: { type: 'string' }
                    }
                },
                response: {
                    ...standardErrorResponses([400, 401, 500])
                }
            }
        },
        async (request, reply) => {
            try {
                const result = await TerminalAuthService.revokeSession(request.params.id, request.user.id);
                return reply.send(result);
            } catch (e: any) {
                return reply.code(403).send({ error: e.message });
            }
        }
    );
}
