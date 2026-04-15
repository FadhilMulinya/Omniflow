import '@fastify/jwt';

/**
 * Authenticated user payload attached by request.jwtVerify()
 *
 * Keep this minimal and stable.
 * Only include fields that are actually present in your JWT payload
 * or returned by formatUser.
 */
export interface AuthenticatedUser {
    id: string;
    username?: string;
    email?: string;
    isAdmin?: boolean;
    role?: string;
}

export interface AuthContext {
    userId: string;
    workspaceId?: string;
    type: 'user' | 'api_key';
    apiKeyId?: string;
    scopes?: string[];
}

declare module 'fastify' {
    interface FastifyRequest {
        apiKeyAuth?: AuthContext;
    }
}

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: AuthenticatedUser;
        user: AuthenticatedUser;
    }
}