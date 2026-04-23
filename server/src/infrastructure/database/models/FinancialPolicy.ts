import mongoose, { Document, Schema, Types } from 'mongoose';
import { FinancialEventType, PolicyAction, PolicyCondition } from '../../../core/financial-runtime/types';

export interface IFinancialPolicy extends Document {
    agentId: Types.ObjectId;
    trigger: FinancialEventType;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    enabled: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}

const FinancialPolicySchema = new Schema(
    {
        agentId: { type: Schema.Types.ObjectId, ref: 'FinancialAgent', required: true, index: true },
        trigger: {
            type: String,
            enum: ['PAYMENT_LINK.PAID', 'FUNDS.RECEIVED', 'TIME.MONTH_STARTED', 'APPROVAL.GRANTED', 'APPROVAL.REJECTED'],
            required: true,
            index: true,
        },
        conditions: { type: [Schema.Types.Mixed], default: [] },
        actions: { type: [Schema.Types.Mixed], default: [] },
        enabled: { type: Boolean, default: true, index: true },
        priority: { type: Number, default: 1, index: true },
    },
    { timestamps: true }
);

export const FinancialPolicy = mongoose.model<IFinancialPolicy>('FinancialPolicy', FinancialPolicySchema);
