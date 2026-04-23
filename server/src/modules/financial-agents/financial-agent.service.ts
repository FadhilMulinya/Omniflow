import mongoose from 'mongoose';
import { FinancialAgentRepository } from './financial-repositories/financial-agent.repository';
import { FinancialAgentStateRepository } from './financial-repositories/financial-agent-state.repository';
import { FinancialPolicyRepository } from './financial-repositories/financial-policy.repository';
import {
    DraftFinancialAgentInput,
    DraftPolicyInput,
    FinancialAgentPreset,
    FinancialAgentValidationService,
    KnownRecipientInput,
} from './financial-agent-validation.service';
import { FinancialAgentDraftingService } from './financial-agent-drafting.service';
import { PolicyAction, PolicyCondition } from '../../core/financial-runtime/types';

export interface CreateFinancialAgentStructuredInput {
    mode: 'structured';
    workspaceId: string;
    draft: DraftFinancialAgentInput;
}

export interface CreateFinancialAgentPromptInput {
    mode: 'prompt';
    workspaceId: string;
    prompt: string;
    preset?: FinancialAgentPreset;
    knownRecipients?: KnownRecipientInput[];
}

export const FinancialAgentService = {
    async createFromPrompt(input: CreateFinancialAgentPromptInput) {
        const draft = await FinancialAgentDraftingService.draftFromPrompt({
            prompt: input.prompt,
            preset: input.preset,
            knownRecipients: input.knownRecipients,
        });

        const validated = FinancialAgentValidationService.validateDraft(draft);
        return this.createFromValidatedDraft(input.workspaceId, validated);
    },

    async createFromStructured(input: CreateFinancialAgentStructuredInput) {
        const validated = FinancialAgentValidationService.validateDraft(input.draft);
        return this.createFromValidatedDraft(input.workspaceId, validated);
    },

    async createFromValidatedDraft(workspaceId: string, draft: DraftFinancialAgentInput) {
        if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
            throw { code: 400, message: 'Invalid workspace ID' };
        }

        const agent = await FinancialAgentRepository.create({
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            name: draft.agent.name,
            description: draft.agent.description,
            status: 'active',
            subscribedEvents: draft.agent.subscribedEvents,
            permissionConfig: draft.agent.permissionConfig,
            approvalConfig: draft.agent.approvalConfig,
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

        const policies = await Promise.all(
            draft.policies.map((policy: DraftPolicyInput) => FinancialPolicyRepository.create({
                agentId: agent._id,
                trigger: policy.trigger,
                conditions: policy.conditions as PolicyCondition[],
                actions: policy.actions as PolicyAction[],
                enabled: true,
                priority: policy.priority ?? 1,
            }))
        );

        return {
            agent,
            state,
            policies,
            assumptions: draft.assumptions,
        };
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
};
