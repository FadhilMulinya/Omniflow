import mongoose, { Schema, Document, Types } from 'mongoose';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface IAgentLog extends Document {
    executionRunId: Types.ObjectId;
    agentDefinitionId: Types.ObjectId;
    nodeId?: string;
    level: LogLevel;
    message: string;
    meta?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const AgentLogSchema: Schema = new Schema(
    {
        executionRunId: { type: Schema.Types.ObjectId, ref: 'ExecutionRun', required: true },
        agentDefinitionId: { type: Schema.Types.ObjectId, ref: 'AgentDefinition', required: true },
        nodeId: { type: String },
        level: { type: String, enum: ['info', 'warn', 'error', 'debug'], default: 'info' },
        message: { type: String, required: true },
        meta: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export const AgentLog = mongoose.model<IAgentLog>('AgentLog', AgentLogSchema);
