import { FastifyPluginAsync } from 'fastify';
import { AIFactory } from '../lib/ai/factory';
import { CompletionRequest } from '../lib/ai/types';

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
    // Test API connection
    fastify.post<{ Body: { provider: string; apiKey: string } }>(
        '/test-connection',
        async (request, reply) => {
            const { provider, apiKey } = request.body;

            if (!apiKey) {
                return reply.code(400).send({ error: 'API Key is required' });
            }

            try {
                const aiProvider = AIFactory.getProvider(provider);
                const success = await aiProvider.testConnection(apiKey);

                if (success) {
                    return { success: true, message: `Connection successful! ${provider} API is working.` };
                } else {
                    throw new Error(`Connection test failed for ${provider}. Please check your API key.`);
                }
            } catch (error: any) {
                return reply.code(500).send({ error: error.message });
            }
        }
    );

    // Generic AI completion endpoint (supports hybrid key management)
    fastify.post<{ Body: CompletionRequest }>(
        '/complete',
        async (request, reply) => {
            const reqBody = request.body;
            const providerName = reqBody.provider || 'gemini';

            // Check for API key in headers (client-side provided) or body
            const apiKey = (request.headers['x-ai-api-key'] as string) || reqBody.apiKey;

            try {
                const aiProvider = AIFactory.getProvider(providerName);
                const response = await aiProvider.generateCompletion({
                    ...reqBody,
                    apiKey // Inject the key (if provided by client)
                });

                return response;
            } catch (error: any) {
                console.error(`AI Completion Error [${providerName}]:`, error);
                return reply.code(500).send({ error: error.message });
            }
        }
    );
};
