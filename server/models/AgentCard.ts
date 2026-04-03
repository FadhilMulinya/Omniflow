import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAgentNetwork {
  network: string            // 'CKB' | 'Ethereum' | 'Solana' | 'Polygon' | custom
  chainType: 'ckb' | 'evm' | 'solana' | 'other'
  walletAddress: string
  rpcUrl?: string
  // Fiber channel support (CKB only for now; extended per chain later)
  fiberPeerId?: string
  fiberNodeUrl?: string      // custom node URL; if absent and fiberNodeType=managed → use ENV
  fiberNodeType?: 'managed' | 'custom'
  isPaymentEnabled: boolean
}

export interface IAgentCard extends Document {
  agentId: Types.ObjectId
  ownerId: Types.ObjectId
  name: string
  description?: string
  version: string
  capabilities: string[]     // e.g. ['payment-channel', 'data-feed', 'defi']
  endpoint?: string          // public HTTP endpoint for A2A calls
  networks: IAgentNetwork[]
  apiKeyHash: string         // sha256 of raw key
  apiKeyPrefix: string       // first 8 chars — for display only
  isPublic: boolean
  status: 'active' | 'inactive'
  lastHeartbeat?: Date
  createdAt: Date
  updatedAt: Date
}

const AgentNetworkSchema = new Schema<IAgentNetwork>(
  {
    network:         { type: String, required: true },
    chainType:       { type: String, enum: ['ckb', 'evm', 'solana', 'other'], required: true },
    walletAddress:   { type: String, required: true },
    rpcUrl:          { type: String },
    fiberPeerId:     { type: String },
    fiberNodeUrl:    { type: String },
    fiberNodeType:   { type: String, enum: ['managed', 'custom'] },
    isPaymentEnabled:{ type: Boolean, default: false },
  },
  { _id: false }
)

const AgentCardSchema = new Schema<IAgentCard>(
  {
    agentId:      { type: Schema.Types.ObjectId, ref: 'AgentDefinition', required: true, unique: true },
    ownerId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:         { type: String, required: true },
    description:  { type: String },
    version:      { type: String, default: '1.0.0' },
    capabilities: [{ type: String }],
    endpoint:     { type: String },
    networks:     { type: [AgentNetworkSchema], default: [] },
    apiKeyHash:   { type: String, required: true, select: false },
    apiKeyPrefix: { type: String, required: true },
    isPublic:     { type: Boolean, default: true },
    status:       { type: String, enum: ['active', 'inactive'], default: 'inactive' },
    lastHeartbeat:{ type: Date },
  },
  { timestamps: true }
)

AgentCardSchema.index({ capabilities: 1 })
AgentCardSchema.index({ 'networks.network': 1 })
AgentCardSchema.index({ isPublic: 1, status: 1 })

export const AgentCard = mongoose.model<IAgentCard>('AgentCard', AgentCardSchema)
