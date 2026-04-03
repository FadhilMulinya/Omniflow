import { FastifyRequest, FastifyReply } from 'fastify'
import { AgentCard }    from '../../../models/AgentCard'
import { AgentPayment } from '../../../models/AgentPayment'
import { payAgent, getAgentPayments } from '../../../services/fiber/PaymentProtocol'
import { resolveChannelConfig } from '../../../services/fiber/ChannelManager'
import { payInvoice, getPaymentStatus } from '../../../services/fiber/InvoiceService'

function getUser(req: FastifyRequest): string | null {
    const c = (req as any).cookies?.['auth_token']
    if (!c) return null
    try { return (req.server.jwt.verify(c) as any).id } catch { return null }
}

// POST /api/fiber/pay  — high-level agent-to-agent payment
export async function handlePayAgent(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { fromAgentId, toAgentId, network, asset, amount, memo, txHash } = request.body as any
    if (!fromAgentId || !toAgentId || !network || !asset || !amount) {
        return reply.code(400).send({ error: 'fromAgentId, toAgentId, network, asset, amount are required' })
    }

    // Verify caller owns the sender agent
    const senderCard = await AgentCard.findOne({ agentId: fromAgentId, ownerId: userId })
    if (!senderCard) return reply.code(403).send({ error: 'Not authorized for sender agent' })

    const senderNet = senderCard.networks.find(n => n.network === network)
    if (!senderNet) return reply.code(400).send({ error: `Sender has no ${network} network configured` })

    const senderCfg = resolveChannelConfig(senderNet)

    try {
        const payment = await payAgent({
            fromAgentId, toAgentId, network, asset, amount, memo, txHash,
            senderFiberNodeUrl: senderCfg.fiberNodeUrl,
            senderFiberAuthToken: senderCfg.fiberAuthToken,
        })
        return reply.code(201).send({ payment })
    } catch (err: any) {
        return reply.code(502).send({ error: err.message })
    }
}

// POST /api/fiber/pay-invoice  — pay a raw invoice string
export async function handlePayInvoice(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId, network = 'CKB', invoice, feeLimit } = request.body as any
    if (!agentId || !invoice) return reply.code(400).send({ error: 'agentId and invoice are required' })

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(404).send({ error: 'Agent card not found' })

    const net = card.networks.find(n => n.network === network)
    if (!net) return reply.code(400).send({ error: `No ${network} network configured` })

    const cfg = resolveChannelConfig(net)
    try {
        const result = await payInvoice(cfg, invoice, feeLimit)
        return { result }
    } catch (err: any) {
        return reply.code(502).send({ error: 'Fiber node error', details: err.message })
    }
}

// GET /api/fiber/payments/:agentId
export async function handleGetPayments(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { agentId } = request.params as any
    const { direction = 'all' } = request.query as any

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(403).send({ error: 'Not authorized' })

    const payments = await getAgentPayments(agentId, direction)
    return { payments }
}

// GET /api/fiber/payment-status/:paymentHash
export async function handlePaymentStatus(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUser(request)
    if (!userId) return reply.code(401).send({ error: 'Unauthorized' })

    const { paymentHash } = request.params as any
    const { agentId, network = 'CKB' } = request.query as any

    const card = await AgentCard.findOne({ agentId, ownerId: userId })
    if (!card) return reply.code(403).send({ error: 'Not authorized' })

    const net = card.networks.find(n => n.network === network)
    if (!net) return reply.code(400).send({ error: `No ${network} network configured` })

    const cfg = resolveChannelConfig(net)
    try {
        const status = await getPaymentStatus(cfg, paymentHash)
        return { status }
    } catch (err: any) {
        return reply.code(502).send({ error: 'Fiber node error', details: err.message })
    }
}
