import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IAgentPayment extends Document {
  fromAgentId: Types.ObjectId
  toAgentId: Types.ObjectId
  network: string            // e.g. 'CKB', 'Ethereum'
  asset: string              // e.g. 'CKB', 'ETH', 'USDT'
  amount: string             // string to preserve precision
  // Fiber-specific (CKB)
  invoiceStr?: string
  paymentHash?: string
  // Generic on-chain
  txHash?: string
  // Status
  status: 'pending' | 'confirmed' | 'failed'
  memo?: string
  marketplacePurchaseId?: Types.ObjectId   // links back to Purchase if part of a sale
  createdAt: Date
  updatedAt: Date
}

const AgentPaymentSchema = new Schema<IAgentPayment>(
  {
    fromAgentId:           { type: Schema.Types.ObjectId, ref: 'AgentDefinition', required: true },
    toAgentId:             { type: Schema.Types.ObjectId, ref: 'AgentDefinition', required: true },
    network:               { type: String, required: true },
    asset:                 { type: String, required: true },
    amount:                { type: String, required: true },
    invoiceStr:            { type: String },
    paymentHash:           { type: String },
    txHash:                { type: String },
    status:                { type: String, enum: ['pending', 'confirmed', 'failed'], default: 'pending' },
    memo:                  { type: String },
    marketplacePurchaseId: { type: Schema.Types.ObjectId, ref: 'Purchase' },
  },
  { timestamps: true }
)

AgentPaymentSchema.index({ fromAgentId: 1 })
AgentPaymentSchema.index({ toAgentId: 1 })
AgentPaymentSchema.index({ paymentHash: 1 })

export const AgentPayment = mongoose.model<IAgentPayment>('AgentPayment', AgentPaymentSchema)
