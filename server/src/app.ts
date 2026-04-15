import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';

import { ENV } from './shared/config/environments';
import { registerRoutes } from './api/routes';
import authPlugin from './api/plugins/auth.plugin';
import apiKeyAuthPlugin from './api/plugins/api-key-auth.plugin';
import rateLimitPlugin from './api/plugins/rate-limit.plugin';

export const app = Fastify({ logger: true });

// ── CORS ────────────────────────────────────────────────────────────────────
app.register(cors, {
    origin: (origin: string | undefined, cb: (err: Error | null, allow: boolean) => void) => {
        if (ENV.NODE_ENV !== 'production') {
            cb(null, true);
            return;
        }
        if (!origin || ENV.ALLOWED_ORIGINS.includes(origin)) {
            cb(null, true);
        } else {
            cb(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
});

// ── PLUGINS ─────────────────────────────────────────────────────────────────
// cookie must be registered before jwt so jwtVerify can read from cookies
app.register(fastifyCookie);
app.register(fastifyJwt, {
    secret: ENV.JWT_SECRET,
    // Automatically extract token from the auth_token cookie.
    // Falls back to Authorization: Bearer header if cookie is absent.
    cookie: {
        cookieName: 'auth_token',
        signed: false,
    },
});

// ── AUTH PLUGIN ───────────────────────────────────────────────────────────────
// Decorates the app with fastify.authenticate (onRequest hook).
// After jwtVerify, request.user: AuthenticatedUser is available in every handler.
app.register(authPlugin);
app.register(apiKeyAuthPlugin);
app.register(rateLimitPlugin);

// ── ROUTES ──────────────────────────────────────────────────────────────────
app.register(registerRoutes, { prefix: '/api' });

// Health check
app.get('/api/health', async () => ({ status: 'ok' }));
