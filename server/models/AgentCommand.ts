import mongoose, { Schema, Document, Types } from 'mongoose'

export type CommandType = 'start' | 'stop'

export interface IAgentCommand extends Document {
  agentId: Types.ObjectId
  issuedBy: Types.ObjectId    // userId
  command: CommandType
  reason?: string             // optional note from user
  createdAt: Date
}

const AgentCommandSchema = new Schema<IAgentCommand>(
  {
    agentId:   { type: Schema.Types.ObjectId, ref: 'AgentDefinition', required: true },
    issuedBy:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    command:   { type: String, enum: ['start', 'stop'], required: true },
    reason:    { type: String },
  },
  { timestamps: true }
)

AgentCommandSchema.index({ agentId: 1, createdAt: -1 })

export const AgentCommand = mongoose.model<IAgentCommand>('AgentCommand', AgentCommandSchema)
