import { FastifyRequest, FastifyReply } from 'fastify'
import { AgentCard } from '../../../models/AgentCard'
import { resolveChannelConfig } from '../../../services/fiber/ChannelManager'
import { generateInvoice, decodeInvoice } from '../../../services/fiber/InvoiceService'

function getUser(req: FastifyRequest): string | null {
    const c = (req as any).cookies?.['auth_token']
    if (!c) return null
    try { return (req.server.jwt.verify(c) as any).id } catch { return null }
}

// POST /api/fiber/invoice/generate
export async function handleGenerateInvoice(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId, network = 'CKB', amountShannons, description, expirySeconds = 3600 } = request.body as any
    if (!agentId) return reply.code(400).send({ error: 'agentId is required' })

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(404).send({ error: 'Agent card not found' })

    const net = card.networks.find(n => n.network === network)
    if (!net) return reply.code(400).send({ error: `No ${network} network configured` })

    const cfg = resolveChannelConfig(net)
    try {
        const result = await generateInvoice(cfg, { amountShannons, description, expirySeconds })
        return { invoice: result }
    } catch (err: any) {
        return reply.code(502).send({ error: 'Fiber node error', details: err.message })
    }
}

// POST /api/fiber/invoice/decode
export async function handleDecodeInvoice(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId, network = 'CKB', invoice } = request.body as any
    if (!agentId || !invoice) return reply.code(400).send({ error: 'agentId and invoice are required' })

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(404).send({ error: 'Agent card not found' })

    const net = card.networks.find(n => n.network === network)
    if (!net) return reply.code(400).send({ error: `No ${network} network configured` })

    const cfg = resolveChannelConfig(net)
    try {
        const result = await decodeInvoice(cfg, invoice)
        return { decoded: result }
    } catch (err: any) {
        return reply.code(502).send({ error: 'Fiber node error', details: err.message })
    }
}
