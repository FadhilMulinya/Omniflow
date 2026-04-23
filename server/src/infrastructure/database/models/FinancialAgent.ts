import mongoose, { Document, Schema, Types } from 'mongoose';
import {
    FINANCIAL_EVENT_TYPES,
    FinancialAgentStatus,
    FinancialEventType,
    FINANCIAL_POLICY_ACTION_TYPES,
} from '../../../core/financial-runtime/types';

export interface IFinancialAgent extends Document {
    workspaceId: Types.ObjectId;
    name: string;
    description?: string;
    status: FinancialAgentStatus;
    subscribedEvents: FinancialEventType[];
    stateId?: Types.ObjectId;
    permissionConfig: {
        maxSpendPerTx?: string;
        maxSpendPerMonth?: string;
        allowedAssets?: string[];
        allowedChains?: string[];
        blockedAssets?: string[];
        blockedChains?: string[];
        blockedRecipients?: string[];
        allowedRecipients?: string[];
        allowedActions?: Array<(typeof FINANCIAL_POLICY_ACTION_TYPES)[number]>;
        blockedActions?: Array<(typeof FINANCIAL_POLICY_ACTION_TYPES)[number]>;
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
            enum: FINANCIAL_EVENT_TYPES,
            default: [],
        },
        stateId: { type: Schema.Types.ObjectId, ref: 'FinancialAgentState' },
        permissionConfig: {
            maxSpendPerTx: { type: String },
            maxSpendPerMonth: { type: String },
            allowedAssets: [{ type: String }],
            allowedChains: [{ type: String }],
            blockedAssets: [{ type: String }],
            blockedChains: [{ type: String }],
            blockedRecipients: [{ type: String }],
            allowedRecipients: [{ type: String }],
            allowedActions: [{ type: String, enum: FINANCIAL_POLICY_ACTION_TYPES }],
            blockedActions: [{ type: String, enum: FINANCIAL_POLICY_ACTION_TYPES }],
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
