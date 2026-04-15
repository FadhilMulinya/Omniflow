import { FastifyInstance } from 'fastify';
import { UserService } from './user.service';
import type { AuthenticatedUser } from '../../shared/contracts/auth';

export async function userController(fastify: FastifyInstance) {
    // ── Notifications ─────────────────────────────────────────────────────────
    fastify.get('/notifications', { onRequest: [fastify.authenticate] }, async (request) => {
        const user = request.user as AuthenticatedUser;
        return UserService.getNotifications(user.id);
    });

    fastify.put<{ Body: { telegram?: boolean; dailySummaries?: boolean; email?: boolean } }>(
        '/notifications', { onRequest: [fastify.authenticate] },
        async (request) => {
            const user = request.user as AuthenticatedUser;
            return UserService.updateNotifications(user.id, request.body);
        }
    );

    // ── Payment methods ───────────────────────────────────────────────────────
    fastify.get('/payment-methods', { onRequest: [fastify.authenticate] }, async (request) => {
        const user = request.user as AuthenticatedUser;
        return UserService.getPaymentMethods(user.id);
    });

    fastify.put<{ Body: { stripe?: { enabled: boolean }; crypto?: Array<{ label: string; network: string; walletAddress: string; asset: string }> } }>(
        '/payment-methods', { onRequest: [fastify.authenticate] },
        async (request) => {
            const user = request.user as AuthenticatedUser;
            return UserService.updatePaymentMethods(user.id, request.body.stripe, request.body.crypto);
        }
    );

    // ── API keys ──────────────────────────────────────────────────────────────
    fastify.get('/api-keys', { onRequest: [fastify.authenticate] }, async (request) => {
        const user = request.user as AuthenticatedUser;
        return UserService.getApiKeys(user.id);
    });

    fastify.put<{ Body: { gemini?: string; openai?: string; openaiBaseUrl?: string; openaiModel?: string; ollamaBaseUrl?: string; ollamaModel?: string } }>(
        '/api-keys', { onRequest: [fastify.authenticate] },
        async (request) => {
            const user = request.user as AuthenticatedUser;
            return UserService.updateApiKeys(user.id, request.body);
        }
    );
}
