import { apiFetch } from './api-client'

export type Performative = 'request' | 'inform' | 'confirm' | 'refuse' | 'query' | 'propose' | 'open-channel'

export interface SendMessagePayload {
    senderId: string
    receiverId: string
    performative: Performative
    content: any
    conversationId?: string
    replyTo?: string
}

export interface RequestChannelPayload {
    fromAgentId: string
    toAgentId: string
    network: string
    fundingAmount: string
    message?: string
}

export const a2aApi = {
    send: (payload: SendMessagePayload) =>
        apiFetch('/a2a/send', { method: 'POST', body: JSON.stringify(payload) }),

    inbox: (agentId: string, params?: { status?: string; page?: number; limit?: number }) => {
        const qs = new URLSearchParams()
        if (params?.status) qs.set('status', params.status)
        if (params?.page)   qs.set('page', String(params.page))
        if (params?.limit)  qs.set('limit', String(params.limit))
        return apiFetch(`/a2a/inbox/${agentId}?${qs}`)
    },

    conversation: (conversationId: string) =>
        apiFetch(`/a2a/conversation/${conversationId}`),

    markRead: (messageId: string) =>
        apiFetch(`/a2a/messages/${messageId}/read`, { method: 'PATCH' }),

    requestChannel: (payload: RequestChannelPayload) =>
        apiFetch('/a2a/request-channel', { method: 'POST', body: JSON.stringify(payload) }),
}
