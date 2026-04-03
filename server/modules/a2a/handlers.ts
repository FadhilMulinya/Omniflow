import { FastifyRequest, FastifyReply } from 'fastify'
import { randomUUID } from 'crypto'
import { A2AMessage } from '../../models/A2AMessage'
import { AgentCard }  from '../../models/AgentCard'
import { AgentDefinition } from '../../models/AgentDefinition'
import { SendMessageSchema, RequestChannelSchema } from './types'
import { extractKeyFromRequest, verifyAgentApiKey } from '../registry/apiKeyUtils'

async function resolveCallerAgentId(request: FastifyRequest): Promise<string | null> {
    const rawKey = extractKeyFromRequest(request.headers as any)
    if (!rawKey) return null

    const cards = await AgentCard.find({}).select('+apiKeyHash').limit(500)
    for (const card of cards) {
        if (verifyAgentApiKey(rawKey, card.apiKeyHash)) return String(card.agentId)
    }
    return null
}

// POST /api/a2a/send
export async function sendMessage(request: FastifyRequest, reply: FastifyReply) {
    const parsed = SendMessageSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const { senderId, receiverId, performative, content, replyTo } = parsed.data
    let { conversationId } = parsed.data

    // Auth: must be the sender agent (via API key) or the agent owner (via JWT cookie)
    const agentId  = await resolveCallerAgentId(request)
    const cookieId = (request as any).cookies?.['auth_token']
    let authorized = agentId === senderId

    if (!authorized && cookieId) {
        try {
            const decoded = (request.server.jwt.verify(cookieId) as any)
            const sender  = await AgentDefinition.findOne({ _id: senderId, ownerId: decoded.id })
            authorized    = !!sender
        } catch { /* noop */ }
    }

    if (!authorized) return reply.code(403).send({ error: 'Not authorized to send as this agent' })

    // Verify sender is running
    const senderDef = await AgentDefinition.findById(senderId).select('status')
    if (senderDef?.status === 'stopped') return reply.code(403).send({ error: 'Sender agent is stopped' })

    if (!conversationId) conversationId = randomUUID()

    const msg = await A2AMessage.create({ conversationId, senderId, receiverId, performative, content, status: 'pending', replyTo })

    // Mark delivered immediately (async delivery model — polling / webhooks TBD)
    await A2AMessage.updateOne({ _id: msg._id }, { status: 'delivered' })

    return reply.code(201).send({ message: msg, conversationId })
}

// GET /api/a2a/inbox/:agentId
export async function getInbox(request: FastifyRequest, reply: FastifyReply) {
    const { agentId } = request.params as any
    const { status, limit = '50', page = '1' } = request.query as any

    const filter: any = { receiverId: agentId }
    if (status) filter.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [messages, total] = await Promise.all([
        A2AMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
        A2AMessage.countDocuments(filter),
    ])
    return { messages, total }
}

// GET /api/a2a/conversation/:conversationId
export async function getConversation(request: FastifyRequest, reply: FastifyReply) {
    const { conversationId } = request.params as any
    const messages = await A2AMessage.find({ conversationId }).sort({ createdAt: 1 })
    return { messages, conversationId }
}

// PATCH /api/a2a/messages/:id/read
export async function markRead(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    await A2AMessage.findByIdAndUpdate(id, { status: 'read' })
    return { ok: true }
}

// POST /api/a2a/request-channel
export async function requestChannel(request: FastifyRequest, reply: FastifyReply) {
    const parsed = RequestChannelSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() })

    const { fromAgentId, toAgentId, network, fundingAmount, message } = parsed.data

    const receiverCard = await AgentCard.findOne({ agentId: toAgentId })
    if (!receiverCard) return reply.code(404).send({ error: 'Receiver agent not in registry' })

    const net = receiverCard.networks.find(n => n.network === network)
    if (!net?.fiberPeerId) return reply.code(400).send({ error: `Receiver has no Fiber peer on ${network}` })

    const conversationId = randomUUID()
    const msg = await A2AMessage.create({
        conversationId,
        senderId:     fromAgentId,
        receiverId:   toAgentId,
        performative: 'open-channel',
        content:      { network, fundingAmount, fiberPeerId: net.fiberPeerId, message },
        status: 'delivered',
    })

    return reply.code(201).send({
        message: msg,
        conversationId,
        fiberPeerId: net.fiberPeerId,
        fiberNodeUrl: net.fiberNodeUrl,
    })
}
