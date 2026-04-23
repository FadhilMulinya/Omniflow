import mongoose from 'mongoose';
import { z } from 'zod';
import { FinancialAgentRepository } from '../financial-repositories/financial-agent.repository';
import { FinancialAgentStateRepository } from '../financial-repositories/financial-agent-state.repository';
import { FinancialPolicyRepository } from '../financial-repositories/financial-policy.repository';
import {
    FINANCIAL_EVENT_TYPES,
    FinancialEventType,
    PolicyAction,
    PolicyCondition,
} from '../../../core/financial-runtime/types';

interface CreateFinancialAgentInput {
    workspaceId: string;
    name: string;
    description?: string;
    subscribedEvents?: FinancialEventType[];
    permissionConfig?: Record<string, unknown>;
    approvalConfig?: Record<string, unknown>;
}

interface AttachPolicyInput {
    workspaceId: string;
    agentId: string;
    trigger: FinancialEventType;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    priority?: number;
}

const conditionSchema = z.object({
    field: z.string().min(1),
    op: z.enum(['eq', 'gt', 'gte', 'lt', 'lte', 'in']),
    value: z.any(),
});

const splitFundsActionSchema = z.object({
    type: z.literal('SPLIT_FUNDS'),
    config: z.object({
        reservePct: z.number().min(0).max(100),
        investPct: z.number().min(0).max(100),
        liquidPct: z.number().min(0).max(100),
        asset: z.string().optional(),
        chain: z.string().optional(),
    }).refine((config) => (config.reservePct + config.investPct + config.liquidPct) === 100, {
        message: 'SPLIT_FUNDS percentages must sum to 100',
    }),
});

const transferFundsActionSchema = z.object({
    type: z.literal('TRANSFER_FUNDS'),
    config: z.object({
        to: z.string().min(1),
        amount: z.string().min(1),
        asset: z.string().min(1),
        chain: z.string().min(1),
    }),
});

const investFundsActionSchema = z.object({
    type: z.literal('INVEST_FUNDS'),
    config: z.object({
        strategy: z.string().min(1),
        amount: z.string().min(1),
        asset: z.string().min(1),
        chain: z.string().min(1),
    }),
});

const policySchema = z.object({
    trigger: z.enum(FINANCIAL_EVENT_TYPES),
    conditions: z.array(conditionSchema),
    actions: z.array(z.union([splitFundsActionSchema, transferFundsActionSchema, investFundsActionSchema])).min(1),
    priority: z.number().int().min(1).optional(),
});

type ParsedPolicy = z.infer<typeof policySchema>;

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
            subscribedEvents: input.subscribedEvents,
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

    async getAgent(workspaceId: string, id: string) {
        const agent = await FinancialAgentRepository.findByIdInWorkspace(id, workspaceId);
        if (!agent) return null;
        const state = await FinancialAgentStateRepository.findByAgentId(id);
        return { agent, state };
    },

    async pauseAgent(workspaceId: string, id: string) {
        return FinancialAgentRepository.updateStatusInWorkspace(id, workspaceId, 'paused');
    },

    async activateAgent(workspaceId: string, id: string) {
        return FinancialAgentRepository.updateStatusInWorkspace(id, workspaceId, 'active');
    },

    async attachPolicy(input: AttachPolicyInput) {
        if (!mongoose.Types.ObjectId.isValid(input.agentId)) {
            throw { code: 400, message: 'Invalid agent ID' };
        }

        const agent = await FinancialAgentRepository.findByIdInWorkspace(input.agentId, input.workspaceId);
        if (!agent) {
            throw { code: 404, message: 'Financial agent not found' };
        }

        const parsed = policySchema.safeParse({
            trigger: input.trigger,
            conditions: input.conditions,
            actions: input.actions,
            priority: input.priority,
        });

        if (!parsed.success) {
            throw { code: 400, message: parsed.error.issues[0]?.message || 'Invalid policy payload' };
        }

        const policy: ParsedPolicy = parsed.data;

        return FinancialPolicyRepository.create({
            agentId: agent._id,
            trigger: policy.trigger,
            conditions: policy.conditions as PolicyCondition[],
            actions: policy.actions,
            enabled: true,
            priority: policy.priority ?? 1,
        });
    },
};
