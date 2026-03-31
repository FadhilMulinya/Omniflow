import mongoose, { Schema, Document } from 'mongoose';
import type { PlanId, BillingCycle } from '../lib/tokens';

export interface IUser extends Document {
    walletAddress?: string;
    email?: string;
    username?: string;
    password?: string;
    name?: string;
    whatsapp?: string;
    telegramUsername?: string;
    stripeAccountId?: string;
    isEmailVerified: boolean;
    // Token & plan system
    tokens: number;
    plan: PlanId;
    planExpiry?: Date;
    planBillingCycle?: BillingCycle;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        walletAddress: { type: String, unique: true, sparse: true },
        email: { type: String, unique: true, sparse: true },
        username: { type: String, unique: true, sparse: true },
        password: { type: String },
        name: { type: String },
        whatsapp: { type: String },
        telegramUsername: { type: String },
        stripeAccountId: { type: String },
        isEmailVerified: { type: Boolean, default: false },
        tokens: { type: Number, default: 0 },
        plan: { type: String, enum: ['free', 'starter', 'pro', 'unlimited'], default: 'free' },
        planExpiry: { type: Date },
        planBillingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
