/**
 * Shared auth contracts — imported by controllers, services, and the auth plugin.
 * Framework-agnostic; does NOT import Fastify or Express types.
 */

/** The decoded JWT payload attached to every authenticated request. */
export interface AuthenticatedUser {
    id: string;
    username: string;
}

/** Augment @fastify/jwt so request.user is typed everywhere. */
declare module '@fastify/jwt' {
    interface FastifyJWT {
        /** shape of the signed payload */
        payload: AuthenticatedUser;
        /** shape of request.user after jwtVerify */
        user: AuthenticatedUser;
    }
}
