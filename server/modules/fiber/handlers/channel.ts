import { FastifyRequest, FastifyReply } from 'fastify'
import { AgentCard } from '../../../models/AgentCard'
import { resolveChannelConfig, openChannel, closeChannel, listChannels, getNodeInfo } from '../../../services/fiber/ChannelManager'

function getUser(req: FastifyRequest): string | null {
    const c = (req as any).cookies?.['auth_token']
    if (!c) return null
    try { return (req.server.jwt.verify(c) as any).id } catch { return null }
}

// POST /api/fiber/channel/open
export async function handleOpenChannel(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId, network = 'CKB', peerId, fundingAmount, isPublic = true } = request.body as any
    if (!agentId || !peerId || !fundingAmount) return reply.code(400).send({ error: 'agentId, peerId, and fundingAmount are required' })

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(404).send({ error: 'Agent card not found' })

    const net = card.networks.find(n => n.network === network)
    if (!net) return reply.code(400).send({ error: `Agent has no ${network} network configured` })

    const cfg = resolveChannelConfig(net)

    try {
        const result = await openChannel(cfg, peerId, fundingAmount, isPublic)
        return { result, message: 'Channel open initiated' }
    } catch (err: any) {
        return reply.code(502).send({ error: 'Fiber node error', details: err.message })
    }
}

// POST /api/fiber/channel/close
export async function handleCloseChannel(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId, network = 'CKB', channelId, force = false } = request.body as any
    if (!agentId || !channelId) return reply.code(400).send({ error: 'agentId and channelId are required' })

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(404).send({ error: 'Agent card not found' })

    const net = card.networks.find(n => n.network === network)
    if (!net) return reply.code(400).send({ error: `No ${network} network configured` })

    const cfg = resolveChannelConfig(net)
    try {
        const result = await closeChannel(cfg, channelId, force)
        return { result, message: 'Channel close initiated' }
    } catch (err: any) {
        return reply.code(502).send({ error: 'Fiber node error', details: err.message })
    }
}

// GET /api/fiber/channels/:agentId
export async function handleListChannels(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId } = request.params as any
    const { network = 'CKB' } = request.query as any

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(404).send({ error: 'Agent card not found' })

    const net = card.networks.find(n => n.network === network)
    if (!net) return reply.code(400).send({ error: `No ${network} network configured` })

    const cfg = resolveChannelConfig(net)
    try {
        const channels = await listChannels(cfg)
        return { channels }
    } catch (err: any) {
        return reply.code(502).send({ error: 'Fiber node error', details: err.message })
    }
}

// GET /api/fiber/node-info/:agentId
export async function handleNodeInfo(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId } = request.params as any
    const { network = 'CKB' } = request.query as any

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(404).send({ error: 'Agent card not found' })

    const net = card.networks.find(n => n.network === network)
    if (!net) return reply.code(400).send({ error: `No ${network} network configured` })

    const cfg = resolveChannelConfig(net)
    try {
        const info = await getNodeInfo(cfg)
        return { info }
    } catch (err: any) {
        return reply.code(502).send({ error: 'Fiber node error', details: err.message })
    }
}
