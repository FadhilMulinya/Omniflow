import mongoose, { Document, Schema, Types } from 'mongoose';
import { FinancialEventType } from '../../../core/financial-runtime/types';

export interface IFinancialEvent extends Document {
    type: FinancialEventType;
    workspaceId: Types.ObjectId;
    agentId?: Types.ObjectId;
    source: string;
    payload: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const FinancialEventSchema = new Schema(
    {
        type: {
            type: String,
            enum: ['PAYMENT_LINK.PAID', 'FUNDS.RECEIVED', 'TIME.MONTH_STARTED', 'APPROVAL.GRANTED', 'APPROVAL.REJECTED'],
            required: true,
            index: true,
        },
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
        agentId: { type: Schema.Types.ObjectId, ref: 'FinancialAgent', index: true },
        source: { type: String, required: true },
        payload: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

export const FinancialEvent = mongoose.model<IFinancialEvent>('FinancialEvent', FinancialEventSchema);
