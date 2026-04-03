import { apiFetch } from './api-client'

export const fiberApi = {
    // Channels
    openChannel: (agentId: string, network: string, peerId: string, fundingAmount: string, isPublic = true) =>
        apiFetch('/fiber/channel/open', { method: 'POST', body: JSON.stringify({ agentId, network, peerId, fundingAmount, isPublic }) }),

    closeChannel: (agentId: string, network: string, channelId: string, force = false) =>
        apiFetch('/fiber/channel/close', { method: 'POST', body: JSON.stringify({ agentId, network, channelId, force }) }),

    listChannels: (agentId: string, network = 'CKB') =>
        apiFetch(`/fiber/channels/${agentId}?network=${network}`),

    nodeInfo: (agentId: string, network = 'CKB') =>
        apiFetch(`/fiber/node-info/${agentId}?network=${network}`),

    // Invoices
    generateInvoice: (agentId: string, network: string, amountShannons?: string, description?: string) =>
        apiFetch('/fiber/invoice/generate', { method: 'POST', body: JSON.stringify({ agentId, network, amountShannons, description }) }),

    decodeInvoice: (agentId: string, network: string, invoice: string) =>
        apiFetch('/fiber/invoice/decode', { method: 'POST', body: JSON.stringify({ agentId, network, invoice }) }),

    // Payments
    payAgent: (payload: { fromAgentId: string; toAgentId: string; network: string; asset: string; amount: string; memo?: string; txHash?: string }) =>
        apiFetch('/fiber/pay', { method: 'POST', body: JSON.stringify(payload) }),

    payInvoice: (agentId: string, network: string, invoice: string, feeLimit?: string) =>
        apiFetch('/fiber/pay-invoice', { method: 'POST', body: JSON.stringify({ agentId, network, invoice, feeLimit }) }),

    getPayments: (agentId: string, direction: 'sent' | 'received' | 'all' = 'all') =>
        apiFetch(`/fiber/payments/${agentId}?direction=${direction}`),

    paymentStatus: (paymentHash: string, agentId: string, network = 'CKB') =>
        apiFetch(`/fiber/payment-status/${paymentHash}?agentId=${agentId}&network=${network}`),
}

export const agentControlApi = {
    start: (agentId: string, reason?: string) =>
        apiFetch(`/agents/${agentId}/start`, { method: 'POST', body: JSON.stringify({ reason }) }),

    stop: (agentId: string, reason?: string) =>
        apiFetch(`/agents/${agentId}/stop`, { method: 'POST', body: JSON.stringify({ reason }) }),

    status: (agentId: string) =>
        apiFetch(`/agents/${agentId}/status`),

    commands: (agentId: string) =>
        apiFetch(`/agents/${agentId}/commands`),
}
