import { FastifyInstance } from 'fastify';
import { TerminalAuthService } from './terminal-auth.service';
import { standardErrorResponses } from '../../shared/docs';

export async function terminalAuthController(fastify: FastifyInstance) {
    fastify.post(
        '/start',
        {
            schema: {
                tags: ['Terminal Auth'],
                summary: 'Start terminal login',
                description: 'Initializes a terminal login session. Returns polling codes and login URL.',
                response: {
                    200: {
                        description: 'Session started successfully',
                        type: 'object',
                        properties: {
                            loginUrl: { type: 'string' },
                            deviceCode: { type: 'string' },
                            userCode: { type: 'string' },
                            expiresIn: { type: 'number' },
                            pollInterval: { type: 'number' },
                        },
                    },
                    ...standardErrorResponses([500]),
                },
            },
        },
        async (_request, reply) => {
            try {
                const session = await TerminalAuthService.startLoginSession();
                return reply.send(session);
            } catch (e: any) {
                return reply.code(500).send({ error: e.message });
            }
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
