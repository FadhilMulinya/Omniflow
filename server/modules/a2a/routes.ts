import { FastifyPluginAsync } from 'fastify'
import { sendMessage, getInbox, getConversation, markRead, requestChannel } from './handlers'

export const a2aRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/send',                            sendMessage)
    fastify.get('/inbox/:agentId',                   getInbox)
    fastify.get('/conversation/:conversationId',     getConversation)
    fastify.patch('/messages/:id/read',              markRead)
    fastify.post('/request-channel',                 requestChannel)
}
