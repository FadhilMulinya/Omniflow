import { FastifyRequest, FastifyReply } from 'fastify'
import { AgentCard } from '../../models/AgentCard'
import { AgentDefinition } from '../../models/AgentDefinition'
import { generateAgentApiKey } from './apiKeyUtils'
import crypto from 'crypto'

function getUser(request: FastifyRequest): string | null {
    const cookie = (request as any).cookies?.['auth_token']
    if (!cookie) return null
    try { return (request.server.jwt.verify(cookie) as any).id } catch { return null }
}

// POST /api/registry/register
export async function registerAgent(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId, capabilities = [], endpoint, networks = [], isPublic = true } = request.body as any

    const agent = await AgentDefinition.findOne({ _id: agentId, ownerId: userId })
    if (!agent) return reply.code(404).send({ error: 'Agent not found or not owned by you' })
    if (agent.isDraft) return reply.code(400).send({ error: 'Publish the agent before registering it' })

    const existing = await AgentCard.findOne({ agentId })
    if (existing) {
        existing.capabilities = capabilities
        existing.endpoint     = endpoint
        existing.networks     = networks
        existing.isPublic     = isPublic
        await existing.save()
        return { card: existing, message: 'Registry entry updated' }
    }

    const { raw, hash, prefix } = generateAgentApiKey()
    const card = await AgentCard.create({
        agentId, ownerId: userId,
        name: agent.name, description: agent.description,
        capabilities, endpoint, networks, isPublic,
        apiKeyHash: hash, apiKeyPrefix: prefix,
        status: 'inactive',
    })

    return reply.code(201).send({ card, agentApiKey: raw, message: 'Agent registered. Save your API key — it will not be shown again.' })
}

// GET /api/registry/agents
export async function listRegistryAgents(request: FastifyRequest, reply: FastifyReply) {
    const { capability, network, name, page = '1', limit = '20' } = request.query as any

    const filter: any = { isPublic: true, status: 'active' }
    if (capability) filter.capabilities = capability
    if (network)    filter['networks.network'] = network
    if (name)       filter.name = { $regex: name, $options: 'i' }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [cards, total] = await Promise.all([
        AgentCard.find(filter).select('-apiKeyHash').skip(skip).limit(parseInt(limit)).lean(),
        AgentCard.countDocuments(filter),
    ])

    return { agents: cards, total, page: parseInt(page), limit: parseInt(limit) }
}

// GET /api/registry/agents/:id
export async function getRegistryAgent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as any
    const card = await AgentCard.findOne({
        $or: [{ _id: id }, { agentId: id }],
        isPublic: true,
    }).select('-apiKeyHash')

    if (!card) return reply.code(404).send({ error: 'Agent not found in registry' })

    // Update heartbeat on fetch
    await AgentCard.updateOne({ _id: card._id }, { lastHeartbeat: new Date() })
    return card
}

// GET /api/registry/well-known/:agentId  — agent discovery endpoint
export async function wellKnownAgent(request: FastifyRequest, reply: FastifyReply) {
    const { agentId } = request.params as any
    const card = await AgentCard.findOne({ agentId, isPublic: true }).select('-apiKeyHash').lean()
    if (!card) return reply.code(404).send({ error: 'Not found' })

    return reply.header('Content-Type', 'application/json').send({
        id: card.agentId,
        name: card.name,
        description: card.description,
        version: card.version,
        capabilities: card.capabilities,
        endpoint: card.endpoint,
        networks: card.networks.map(n => ({
            network: n.network, chainType: n.chainType,
            walletAddress: n.walletAddress, isPaymentEnabled: n.isPaymentEnabled,
        })),
        status: card.status,
    })
}

// PUT /api/registry/agents/:id/heartbeat
export async function heartbeat(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })
    const { id } = request.params as any
    await AgentCard.findOneAndUpdate({ agentId: id, ownerId: userId }, { lastHeartbeat: new Date() })
    return { ok: true }
}

// DELETE /api/registry/agents/:id
export async function deregisterAgent(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })
    const { id } = request.params as any
    const result = await AgentCard.findOneAndDelete({ agentId: id, ownerId: userId })
    if (!result) return reply.code(404).send({ error: 'Not found or not owned by you' })
    return { message: 'Agent deregistered' }
}

// POST /api/registry/agents/:id/rotate-key
export async function rotateApiKey(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })
    const { id } = request.params as any

    const { raw, hash, prefix } = generateAgentApiKey()
    const card = await AgentCard.findOneAndUpdate(
        { agentId: id, ownerId: userId },
        { apiKeyHash: hash, apiKeyPrefix: prefix },
        { new: true }
    )
    if (!card) return reply.code(404).send({ error: 'Not found' })
    return { agentApiKey: raw, prefix, message: 'API key rotated. Save it — shown once.' }
}
