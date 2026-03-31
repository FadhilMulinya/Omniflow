import mongoose, { Schema, Document, Types } from 'mongoose';
import { CharacterSchema } from '../characters/schema';

export interface IAgentDefinition extends Document {
    ownerId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    name: string;
    description?: string;
    agentType: 'financial_agent' | 'social_agent' | 'operational_agent';
    character?: CharacterSchema;
    identities: Record<string, any>;
    memory: Record<string, any>;
    modelProvider: 'gemini' | 'openai' | 'ollama';
    modelConfig: {
        modelName: string;
        temperature?: number;
        maxTokens?: number;
    };
    isActive: boolean;
    isDraft: boolean;
    persona?: string;
    blockchain?: {
        network: string;
        rpcUrl?: string;
        walletAddress?: string;
        publicKey?: string;
        privateKey?: string;
        walletType?: 'managed' | 'externally_owned';
    }[];
    graph: {
        nodes: any[];
        edges: any[];
    };
    exportSettings?: {
        embedEnabled: boolean;
        allowedDomains: string[];
        allowedIPs: string[];
        theme: string;
        pwaDownloadCount: number;
        lastExportedAt: Date;
    };
    marketplace?: {
        published: boolean;
        category: string;
        visibility: 'public' | 'unlisted';
        pricing: {
            type: 'free' | 'paid';
            price: number;
            currency: string;
        };
        paymentMethods: {
            stripe: {
                enabled: boolean;
                stripeAccountId: string;
            };
            crypto: {
                enabled: boolean;
                walletAddress: string;
                network: string;
                asset: string;
                amount: number;
            };
        };
        stats: {
            views: number;
            purchases: number;
            rating: number;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

const AgentDefinitionSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        name: { type: String, required: true },
        description: { type: String },
        agentType: {
            type: String,
            enum: ['financial_agent', 'social_agent', 'operational_agent'],
            default: 'operational_agent',
        },
        character: { type: Schema.Types.Mixed },
        identities: { type: Schema.Types.Mixed, default: {} },
        memory: { type: Schema.Types.Mixed, default: {} },
        modelProvider: { type: String, enum: ['gemini', 'openai', 'ollama'], default: 'ollama' },
        modelConfig: {
            modelName: { type: String, default: 'qwen2.5:3b' },
            temperature: { type: Number, default: 0.7 },
            maxTokens: { type: Number },
        },
        isActive: { type: Boolean, default: true },
        isDraft: { type: Boolean, default: true },
        persona: { type: String },
        blockchain: [
            {
                network: { type: String },
                rpcUrl: { type: String },
                walletAddress: { type: String },
                publicKey: { type: String },
                privateKey: { type: String },
                walletType: { type: String, enum: ['managed', 'externally_owned'] },
            },
        ],
        graph: { type: Schema.Types.Mixed, default: { nodes: [], edges: [] } },
        // Mixed type — same pattern as graph/identities — avoids subdocument casting errors
        marketplace: { type: Schema.Types.Mixed, default: null },
        exportSettings: {
            embedEnabled: { type: Boolean, default: false },
            allowedDomains: [{ type: String }],
            allowedIPs: [{ type: String }],
            theme: { type: String, default: 'dark' },
            pwaDownloadCount: { type: Number, default: 0 },
            lastExportedAt: { type: Date },
        },
        marketplace: {
            published: { type: Boolean, default: false },
            category: { type: String, default: 'Custom' },
            visibility: { type: String, enum: ['public', 'unlisted'], default: 'public' },
            pricing: {
                type: { type: String, enum: ['free', 'paid'], default: 'free' },
                price: { type: Number, default: 0 },
                currency: { type: String, default: 'USD' },
            },
            paymentMethods: {
                stripe: {
                    enabled: { type: Boolean, default: false },
                    stripeAccountId: { type: String },
                },
                crypto: {
                    enabled: { type: Boolean, default: false },
                    walletAddress: { type: String },
                    network: { type: String },
                    asset: { type: String },
                    amount: { type: Number },
                },
            },
            stats: {
                views: { type: Number, default: 0 },
                purchases: { type: Number, default: 0 },
                rating: { type: Number, default: 0 },
            },
        },
    },
    { timestamps: true }
);

export const AgentDefinition = mongoose.model<IAgentDefinition>(
    'AgentDefinition',
    AgentDefinitionSchema
);
