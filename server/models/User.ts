import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    walletAddress?: string;
    email?: string;
    username?: string;
    password?: string;
    whatsapp?: string;
    telegramUsername?: string;
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
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
