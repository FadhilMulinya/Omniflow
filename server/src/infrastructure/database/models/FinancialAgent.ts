import mongoose, { Document, Schema, Types } from 'mongoose';
import { FinancialAgentStatus, FinancialEventType } from '../../../core/financial-runtime/types';

export interface IFinancialAgent extends Document {
    workspaceId: Types.ObjectId;
    name: string;
    description?: string;
    status: FinancialAgentStatus;
    subscribedEvents: FinancialEventType[];
    policyIds: Types.ObjectId[];
    stateId?: Types.ObjectId;
    permissionConfig: {
        maxSpendPerTx?: string;
        maxSpendPerMonth?: string;
        allowedAssets?: string[];
        allowedChains?: string[];
        allowedRecipients?: string[];
        allowedActions?: Array<'SPLIT_FUNDS' | 'TRANSFER_FUNDS' | 'INVEST_FUNDS' | 'REQUEST_APPROVAL'>;
    };
    approvalConfig: {
        requireApprovalAbove?: string;
        requireApprovalForNewRecipients?: boolean;
        requireApprovalForInvestments?: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const FinancialAgentSchema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
        name: { type: String, required: true },
        description: { type: String },
        status: { type: String, enum: ['active', 'paused'], default: 'active', index: true },
        subscribedEvents: {
            type: [String],
            enum: ['PAYMENT_LINK.PAID', 'FUNDS.RECEIVED', 'TIME.MONTH_STARTED', 'APPROVAL.GRANTED', 'APPROVAL.REJECTED'],
            default: [],
        },
        policyIds: [{ type: Schema.Types.ObjectId, ref: 'FinancialPolicy' }],
        stateId: { type: Schema.Types.ObjectId, ref: 'FinancialAgentState' },
        permissionConfig: {
            maxSpendPerTx: { type: String },
            maxSpendPerMonth: { type: String },
            allowedAssets: [{ type: String }],
            allowedChains: [{ type: String }],
            allowedRecipients: [{ type: String }],
            allowedActions: [{ type: String, enum: ['SPLIT_FUNDS', 'TRANSFER_FUNDS', 'INVEST_FUNDS', 'REQUEST_APPROVAL'] }],
        },
        approvalConfig: {
            requireApprovalAbove: { type: String },
            requireApprovalForNewRecipients: { type: Boolean },
            requireApprovalForInvestments: { type: Boolean },
        },
    },
    { timestamps: true }
);

export const FinancialAgent = mongoose.model<IFinancialAgent>('FinancialAgent', FinancialAgentSchema);
