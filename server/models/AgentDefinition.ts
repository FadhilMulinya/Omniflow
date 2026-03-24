import mongoose, { Schema, Document, Types } from 'mongoose';
import { CharacterSchema } from '../characters/schema';

export interface IAgentDefinition extends Document {
    ownerId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    name: string;
    description?: string;
    character?: CharacterSchema;
    modelProvider: 'gemini' | 'openai';
    modelConfig: {
        modelName: string;
        temperature?: number;
        maxTokens?: number;
    };
    graph: {
        nodes: any[];
        edges: any[];
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const AgentDefinitionSchema: Schema = new Schema(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
        name: { type: String, required: true },
        description: { type: String },
        character: { type: Schema.Types.Mixed },
        modelProvider: { type: String, enum: ['gemini', 'openai'], default: 'gemini' },
        modelConfig: {
            modelName: { type: String, default: 'gemini-1.5-flash' },
            temperature: { type: Number, default: 0.7 },
            maxTokens: { type: Number },
        },
        graph: {
            nodes: { type: Array, default: [] },
            edges: { type: Array, default: [] },
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const AgentDefinition = mongoose.model<IAgentDefinition>('AgentDefinition', AgentDefinitionSchema);
