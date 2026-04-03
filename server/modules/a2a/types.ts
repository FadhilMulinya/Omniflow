import { z } from 'zod'

export const PerformativeEnum = z.enum(['request', 'inform', 'confirm', 'refuse', 'query', 'propose', 'open-channel'])

export const SendMessageSchema = z.object({
    senderId:       z.string(),
    receiverId:     z.string(),
    performative:   PerformativeEnum,
    content:        z.any(),
    conversationId: z.string().optional(),   // omit → auto-generate
    replyTo:        z.string().optional(),
})

export const RequestChannelSchema = z.object({
    fromAgentId:     z.string(),
    toAgentId:       z.string(),
    network:         z.string(),             // 'CKB' | 'Ethereum' | etc.
    fundingAmount:   z.string(),             // in network's smallest unit
    message:         z.string().optional(),
})

export type SendMessageInput   = z.infer<typeof SendMessageSchema>
export type RequestChannelInput = z.infer<typeof RequestChannelSchema>
