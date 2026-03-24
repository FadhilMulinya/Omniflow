import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IKeyPolicy extends Document {
    workspaceId: Types.ObjectId;
    name: string;
    maxDailyGasUsd: number;
    allowedContracts: string[];
    requiresApproval: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const KeyPolicySchema: Schema = new Schema(
    {
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        name: { type: String, required: true },
        maxDailyGasUsd: { type: Number, default: 0 },
        allowedContracts: [{ type: String }],
        requiresApproval: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const KeyPolicy = mongoose.model<IKeyPolicy>('KeyPolicy', KeyPolicySchema);
