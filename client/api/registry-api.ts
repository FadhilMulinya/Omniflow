import { apiFetch } from './api-client'

export interface AgentNetwork {
    network: string
    chainType: 'ckb' | 'evm' | 'solana' | 'other'
    walletAddress: string
    rpcUrl?: string
    fiberPeerId?: string
    fiberNodeUrl?: string
    fiberNodeType?: 'managed' | 'custom'
    isPaymentEnabled: boolean
}

export interface RegisterAgentPayload {
    agentId: string
    capabilities: string[]
    endpoint?: string
    networks: AgentNetwork[]
    isPublic?: boolean
}

export const registryApi = {
    register: (payload: RegisterAgentPayload) =>
        apiFetch('/registry/register', { method: 'POST', body: JSON.stringify(payload) }),

    list: (params?: { capability?: string; network?: string; name?: string; page?: number; limit?: number }) => {
        const qs = new URLSearchParams()
        if (params?.capability) qs.set('capability', params.capability)
        if (params?.network)    qs.set('network', params.network)
        if (params?.name)       qs.set('name', params.name)
        if (params?.page)       qs.set('page', String(params.page))
        if (params?.limit)      qs.set('limit', String(params.limit))
        return apiFetch(`/registry/agents?${qs}`)
    },

    get: (id: string) => apiFetch(`/registry/agents/${id}`),

    wellKnown: (agentId: string) => apiFetch(`/registry/well-known/${agentId}`),

    heartbeat: (agentId: string) =>
        apiFetch(`/registry/agents/${agentId}/heartbeat`, { method: 'PUT' }),

    deregister: (agentId: string) =>
        apiFetch(`/registry/agents/${agentId}`, { method: 'DELETE' }),

    rotateKey: (agentId: string) =>
        apiFetch(`/registry/agents/${agentId}/rotate-key`, { method: 'POST' }),
}
