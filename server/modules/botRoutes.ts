import { FastifyPluginAsync } from 'fastify';
import { AIFactory } from '../lib/ai/factory';
import type { MessageRole } from '../lib/ai/types';
import { ENV } from '../lib/environments';

const Onhandl_SYSTEM_PROMPT = `You are Onhandl Assistant — the official support guide for the Onhandl platform.
Onhandl is an AI workflow platform letting users build visual multi-agent workflows connecting to crypto networks via Nervos CKB and social mediums. Answer strictly within your scope of knowledge concisely.`;

export const botRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post<{ Body: { message: string; history?: Array<{ role: string; content: string }> } }>(
        '/chat',
        async (request, reply) => {
            const { message, history = [] } = request.body;

            if (!message?.trim()) {
                return reply.code(400).send({ error: 'Message is required' });
            }

            const msgList = [
                { role: 'system' as MessageRole, content: Onhandl_SYSTEM_PROMPT },
                ...history.slice(-10).map((m) => ({
                    role: (m.role === 'user' ? 'user' : 'assistant') as MessageRole,
                    content: m.content,
                })),
                { role: 'user' as MessageRole, content: message },
            ];

            // Try providers in priority order: gemini → openai → ollama
            const providerOrder: string[] = [];
            if (ENV.GEMINI_API_KEY) providerOrder.push('gemini');
            if (ENV.OPENAI_API_KEY) providerOrder.push('openai');
            providerOrder.push('ollama'); // always available as last resort

            let lastError: unknown;
            for (const providerName of providerOrder) {
                try {
                    const aiProvider = AIFactory.getProvider(providerName);
                    const response = await aiProvider.generateCompletion({ messages: msgList });
                    return { reply: response.content };
                } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    console.warn(`[BotChat] Provider "${providerName}" failed:`, msg);
                    lastError = err;
                }
            }

            console.error('[BotChat] All providers failed:', lastError);
            return reply.code(500).send({ error: 'Bot is temporarily unavailable. Please try again.' });
        }
    );
};
