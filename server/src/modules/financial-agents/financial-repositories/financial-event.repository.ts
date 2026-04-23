import mongoose from 'mongoose';
import { FinancialEvent, IFinancialEvent } from '../../../infrastructure/database/models/FinancialEvent';

export const FinancialEventRepository = {
    async create(data: Partial<IFinancialEvent>) {
        return FinancialEvent.create(data);
    },

    async findRecentByAgent(agentId: string, limit = 25): Promise<IFinancialEvent[]> {
        if (!mongoose.Types.ObjectId.isValid(agentId)) return [];
        return FinancialEvent.find({ agentId }).sort({ createdAt: -1 }).limit(limit);
    },
};
