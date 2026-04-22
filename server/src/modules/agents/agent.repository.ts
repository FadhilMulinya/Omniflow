import { AgentDefinition } from '../../infrastructure/database/models/AgentDefinition';

export const AgentRepository = {
    async findById(id: string) {
        return AgentDefinition.findById(id);
    },

    async findMany(filter: Record<string, unknown>) {
        return AgentDefinition.find(filter).sort({ updatedAt: -1 });
    },

    async findWithSelect(filter: Record<string, unknown>, select: string) {
        return AgentDefinition.find(filter).select(select);
    },

    async count(filter: Record<string, unknown>) {
        return AgentDefinition.countDocuments(filter);
    },

    async create(data: Record<string, unknown>) {
        const agent = new AgentDefinition(data);
        await agent.save();
        return agent;
    },

    async save(agent: any) {
        return agent.save();
    },

    async findByIdAndDelete(id: string) {
        return AgentDefinition.findByIdAndDelete(id);
    },

    async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) {
        return AgentDefinition.updateOne(filter, update);
    },
};
