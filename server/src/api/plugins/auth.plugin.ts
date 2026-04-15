import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

// Import module augmentation side-effect (types only)
import '../../shared/contracts/auth';

/**
 * Auth Plugin
 *
 * Registers `fastify.authenticate` — a preHandler/onRequest hook that:
 * 1. Calls `request.jwtVerify()` which reads the `auth_token` cookie
 *    (configured in the JWT plugin registration in app.ts)
 * 2. Populates `request.user: AuthenticatedUser` automatically
 * 3. Throws 401 on missing / invalid / expired token
 *
 * Usage in routes:
 *   fastify.get('/protected', { onRequest: [fastify.authenticate] }, handler)
 *
 * Inside handler:
 *   request.user.id       // string
 *   request.user.username // string
 */
async function authPlugin(fastify: FastifyInstance) {
    fastify.decorate(
        'authenticate',
        async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
            try {
                await request.jwtVerify();
            } catch (err) {
                reply.send(err); // @fastify/jwt sends a 401 with the correct body
            }
        }
    );
}

export default authPlugin;

// Augment FastifyInstance so TypeScript knows about fastify.authenticate
declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    }
}
