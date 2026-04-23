import mongoose from 'mongoose';
import { FinancialAgentRepository } from '../financial-repositories/financial-agent.repository';
import { FinancialAgentStateRepository } from '../financial-repositories/financial-agent-state.repository';
import { FinancialPolicyRepository } from '../financial-repositories/financial-policy.repository';
import { FinancialEventType, PolicyAction, PolicyCondition } from '../../../core/financial-runtime/types';

interface CreateFinancialAgentInput {
    workspaceId: string;
    name: string;
    description?: string;
    subscribedEvents?: FinancialEventType[];
    permissionConfig?: Record<string, unknown>;
    approvalConfig?: Record<string, unknown>;
}

interface AttachPolicyInput {
    agentId: string;
    trigger: FinancialEventType;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    priority?: number;
}

export const FinancialAgentService = {
    async createAgent(input: CreateFinancialAgentInput) {
        if (!mongoose.Types.ObjectId.isValid(input.workspaceId)) {
            throw { code: 400, message: 'Invalid workspace ID' };
        }

        const agent = await FinancialAgentRepository.create({
            workspaceId: new mongoose.Types.ObjectId(input.workspaceId),
            name: input.name,
            description: input.description,
            status: 'active',
            subscribedEvents: input.subscribedEvents || ['FUNDS.RECEIVED'],
            policyIds: [],
            permissionConfig: input.permissionConfig || {},
            approvalConfig: input.approvalConfig || {},
        });

        const state = await FinancialAgentStateRepository.create({
            agentId: agent._id,
            balances: {},
            counters: {
                monthlySpend: '0',
                totalReceived: '0',
            },
            pendingApprovalIds: [],
            metadata: {},
        });

        agent.stateId = state._id as mongoose.Types.ObjectId;
        await FinancialAgentRepository.save(agent);
        return agent;
    },

    async listAgents(workspaceId: string) {
        return FinancialAgentRepository.findManyByWorkspace(workspaceId);
    },

    async getAgent(id: string) {
        const agent = await FinancialAgentRepository.findById(id);
        if (!agent) return null;
        const state = await FinancialAgentStateRepository.findByAgentId(id);
        return { agent, state };
    },

    async pauseAgent(id: string) {
        return FinancialAgentRepository.updateStatus(id, 'paused');
    },

    async activateAgent(id: string) {
        return FinancialAgentRepository.updateStatus(id, 'active');
    },

    async attachPolicy(input: AttachPolicyInput) {
        if (!mongoose.Types.ObjectId.isValid(input.agentId)) {
            throw { code: 400, message: 'Invalid agent ID' };
        }

        const policy = await FinancialPolicyRepository.create({
            agentId: new mongoose.Types.ObjectId(input.agentId),
            trigger: input.trigger,
            conditions: input.conditions,
            actions: input.actions,
            enabled: true,
            priority: input.priority ?? 1,
        });

        const agent = await FinancialAgentRepository.findById(input.agentId);
        if (agent) {
            agent.policyIds = [...(agent.policyIds || []), policy._id as mongoose.Types.ObjectId];
            await FinancialAgentRepository.save(agent);
        }

        return policy;
    },
};
