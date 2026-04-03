/**
 * PaymentProtocol — orchestrates agent-to-agent payments.
 *
 * CKB/Fiber flow:
 *   1. Look up receiver AgentCard → find CKB network entry → get fiber node config
 *   2. Generate invoice on receiver's fiber node
 *   3. Pay invoice from sender's fiber node
 *   4. Record AgentPayment in DB
 *
 * Other networks: record tx hash; on-chain verification TBD (Blockscout MCP).
 */
import { AgentCard }     from '../../models/AgentCard'
import { AgentPayment }  from '../../models/AgentPayment'
import { resolveChannelConfig } from './ChannelManager'
import { generateInvoice, payInvoice } from './InvoiceService'

export interface PayAgentParams {
    fromAgentId: string
    toAgentId: string
    network: string            // 'CKB' | 'Ethereum' | etc.
    asset: string
    amount: string             // in smallest unit (shannons for CKB, wei for ETH, etc.)
    memo?: string
    // For CKB/Fiber
    senderFiberNodeUrl?: string
    senderFiberAuthToken?: string
    // For non-Fiber chains
    txHash?: string
}

export async function payAgent(params: PayAgentParams) {
    const { fromAgentId, toAgentId, network, asset, amount, memo, txHash } = params

    const [senderCard, receiverCard] = await Promise.all([
        AgentCard.findOne({ agentId: fromAgentId }).select('+apiKeyHash'),
        AgentCard.findOne({ agentId: toAgentId }),
    ])

    if (!receiverCard) throw new Error('Receiver agent not found in registry')

    const receiverNet = receiverCard.networks.find(n => n.network === network)
    if (!receiverNet) throw new Error(`Receiver agent does not support network: ${network}`)

    // ── CKB Fiber path ──────────────────────────────────────────────────────
    if (network === 'CKB' && receiverNet.fiberPeerId) {
        const receiverCfg = resolveChannelConfig(receiverNet)
        const senderCfg   = {
            fiberNodeUrl:   params.senderFiberNodeUrl,
            fiberAuthToken: params.senderFiberAuthToken,
        }

        // Generate invoice on receiver's node
        const invoiceRes = await generateInvoice(receiverCfg, {
            amountShannons: amount,
            description: memo || `Payment from agent ${fromAgentId}`,
        })
        const invoiceStr   = invoiceRes?.invoice_address
        const paymentHash  = invoiceRes?.payment_hash

        // Pay invoice from sender's node
        await payInvoice(senderCfg, invoiceStr)

        const record = await AgentPayment.create({
            fromAgentId, toAgentId, network, asset, amount,
            invoiceStr, paymentHash, status: 'pending', memo,
        })
        return record
    }

    // ── Generic on-chain path (tx hash submitted by caller) ─────────────────
    const record = await AgentPayment.create({
        fromAgentId, toAgentId, network, asset, amount,
        txHash, status: txHash ? 'pending' : 'pending', memo,
    })
    return record
}

export async function getAgentPayments(agentId: string, direction: 'sent' | 'received' | 'all' = 'all') {
    const filter: any = {}
    if (direction === 'sent')     filter.fromAgentId = agentId
    else if (direction === 'received') filter.toAgentId = agentId
    else filter.$or = [{ fromAgentId: agentId }, { toAgentId: agentId }]

    return AgentPayment.find(filter).sort({ createdAt: -1 }).limit(100)
}
