import mongoose from 'mongoose';
import { FinancialAgent, IFinancialAgent } from '../../../infrastructure/database/models/FinancialAgent';
import { FinancialEventType, FinancialAgentStatus } from '../../../core/financial-runtime/types';

export const FinancialAgentRepository = {
    async findById(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return FinancialAgent.findById(id);
    },

    async findManyByWorkspace(workspaceId: string): Promise<IFinancialAgent[]> {
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) return [];
        return FinancialAgent.find({ workspaceId }).sort({ updatedAt: -1 });
    },

    async findSubscribedToEvent(workspaceId: string, eventType: FinancialEventType): Promise<IFinancialAgent[]> {
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) return [];
        return FinancialAgent.find({
            workspaceId,
            status: 'active',
            subscribedEvents: eventType,
        });
    },

    async create(data: Partial<IFinancialAgent>) {
        return FinancialAgent.create(data);
    },

    async save(agent: IFinancialAgent) {
        return agent.save();
    },

    async updateStatus(id: string, status: FinancialAgentStatus) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return FinancialAgent.findByIdAndUpdate(id, { status }, { new: true });
    },
};
