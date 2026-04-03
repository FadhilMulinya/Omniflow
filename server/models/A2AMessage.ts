import mongoose, { Schema, Document, Types } from 'mongoose'

export type Performative = 'request' | 'inform' | 'confirm' | 'refuse' | 'query' | 'propose' | 'open-channel'

export interface IA2AMessage extends Document {
  conversationId: string
  senderId: Types.ObjectId      // AgentDefinition
  receiverId: Types.ObjectId    // AgentDefinition
  performative: Performative
  content: any
  status: 'pending' | 'delivered' | 'read' | 'failed'
  replyTo?: Types.ObjectId      // parent message for threading
  createdAt: Date
  updatedAt: Date
}

const A2AMessageSchema = new Schema<IA2AMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    senderId:       { type: Schema.Types.ObjectId, ref: 'AgentDefinition', required: true },
    receiverId:     { type: Schema.Types.ObjectId, ref: 'AgentDefinition', required: true },
    performative:   {
      type: String,
      enum: ['request', 'inform', 'confirm', 'refuse', 'query', 'propose', 'open-channel'],
      required: true,
    },
    content:        { type: Schema.Types.Mixed, required: true },
    status:         { type: String, enum: ['pending', 'delivered', 'read', 'failed'], default: 'pending' },
    replyTo:        { type: Schema.Types.ObjectId, ref: 'A2AMessage' },
  },
  { timestamps: true }
)

A2AMessageSchema.index({ receiverId: 1, status: 1 })
A2AMessageSchema.index({ senderId: 1 })

export const A2AMessage = mongoose.model<IA2AMessage>('A2AMessage', A2AMessageSchema)
