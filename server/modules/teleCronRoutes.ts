import { FastifyPluginAsync } from 'fastify';
import { telegramService } from '../services/telegram-service';
import { backgroundService } from '../services/background-service';

export const teleCronRoutes: FastifyPluginAsync = async (fastify) => {
    // Telegram Webhook
    fastify.post('/telegram/webhook', async (request, reply) => {
        try {
            const update: any = request.body;
            const processedUpdate = telegramService.processUpdate(update);

            if (!processedUpdate) {
                return reply.code(400).send({ status: 'error', message: 'Invalid update' });
            }

            console.log('Received Telegram update in Fastify:', processedUpdate);

            // Add logic from the original handler if necessary
            // e.g. processing the message
            if (processedUpdate.type === 'message' && processedUpdate.text) {
                // Handle logic
            }

            return reply.send({ status: 'ok' });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ status: 'error', message: 'Internal server error' });
        }
    });

    // Telegram Verification
    fastify.get('/telegram/webhook', async (request, reply) => {
        // Basic verification placeholder (similar to original logic)
        return reply.send('Verification endpoint operational');
    });

    // Cron Run
    fastify.get('/cron', async (request, reply) => {
        const apiKey = request.headers['x-api-key'];
        if (apiKey !== process.env.CRON_API_KEY) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }

        try {
            await backgroundService.processJobs();
            return reply.send({ status: 'ok' });
        } catch (err) {
            console.error(err);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    });

    // Telegram Test Connection
    fastify.post<{ Body: { botToken: string; chatId: string; botName?: string } }>(
        '/telegram/test-connection',
        async (request, reply) => {
            const { botToken, chatId, botName } = request.body;

            if (!botToken || !chatId) {
                return reply.code(400).send({ error: 'Bot Token and Chat ID are required' });
            }

            try {
                // We can't easily use the existing telegramService singleton because it might have a different token
                // So we might need to instantiate a temporary one or add a method to the service to test arbitrary tokens
                const { TelegramService } = require('../services/telegram-service');
                const tempService = new TelegramService(botToken);

                const result = await tempService.sendMessage(
                    chatId,
                    `🔄 *Test Connection*\n\nThis is a test message from your ${botName || 'Trading Bot'}. If you see this, the connection is working!`,
                    { parse_mode: 'Markdown' }
                );

                if (result && result.ok) {
                    return { success: true, message: 'Connection successful! Test message sent to Telegram.' };
                } else {
                    throw new Error(result.description || 'Failed to send message');
                }
            } catch (error: any) {
                return reply.code(500).send({ error: `Connection failed: ${error.message}` });
            }
        }
    );
};
