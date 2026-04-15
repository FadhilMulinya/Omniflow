import { FastifyPluginAsync } from 'fastify';
import { ENV } from '../../shared/config/environments';
import {
    enableEmbed, exportPwa, enableMcp, getEmbedMeta, checkEmbedAccess, streamEmbedChat,
} from './agent-export.service';

export const exportRoutes: FastifyPluginAsync = async (fastify) => {

    fastify.post<{ Params: { id: string }; Body: { allowedDomains?: string[]; allowedIPs?: string[]; theme?: string } }>(
        '/agents/:id/export/embed',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try {
                const { allowedDomains = [], allowedIPs = [], theme = 'dark' } = request.body || {};
                return await enableEmbed(request.params.id, allowedDomains, allowedIPs, theme);
            } catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
        }
    );

    fastify.post<{ Params: { id: string } }>(
        '/agents/:id/export/pwa',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try { return await exportPwa(request.params.id); }
            catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
        }
    );

    fastify.post<{ Params: { id: string } }>(
        '/agents/:id/export/mcp',
        { onRequest: [fastify.authenticate] },
        async (request, reply) => {
            try { return await enableMcp(request.params.id); }
            catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
        }
    );

    // Public embed routes — no auth required
    fastify.get<{ Params: { id: string } }>('/embed/agent/:id', async (request, reply) => {
        try { return await getEmbedMeta(request.params.id); }
        catch (e: any) { return reply.code(e.code || 500).send({ error: e.message }); }
    });

    fastify.post<{ Params: { id: string }; Body: { prompt: string; sessionId?: string } }>(
        '/embed/agent/:id/chat',
        async (request, reply) => {
            const { id } = request.params;
            const { prompt, sessionId = `embed_${id}_${Date.now()}` } = request.body;
            if (!prompt?.trim()) return reply.code(400).send({ error: 'prompt is required' });
            try {
                const meta = await getEmbedMeta(id);
                if (ENV.NODE_ENV === 'production') {
                    const forwarded = request.headers['x-forwarded-for'];
                    const clientIP = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() || request.ip;
                    const origin = (request.headers['origin'] as string) || '';
                    const access = checkEmbedAccess({ exportSettings: meta }, clientIP, origin);
                    if (!access.allowed) return reply.code(403).send({ error: access.reason });
                }
                const readable = await streamEmbedChat(id, prompt, sessionId);
                return reply
                    .header('Content-Type', 'text/event-stream').header('Cache-Control', 'no-cache')
                    .header('Connection', 'keep-alive').header('Access-Control-Allow-Origin', '*')
                    .send(readable);
            } catch (e: any) {
                return reply.code(e.code || 500).send({ error: e.message });
            }
        }
    );
};
