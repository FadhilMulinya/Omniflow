import { z } from 'zod';

export const FINANCIAL_DRAFT_EVENT_TYPES = [
    'FUNDS.RECEIVED',
    'TIME.MONTH_STARTED',
    'APPROVAL.GRANTED',
    'APPROVAL.REJECTED',
] as const;

export const FINANCIAL_AGENT_PRESETS = [
    'conservative_treasury',
    'balanced_allocator',
    'aggressive_allocator',
] as const;

export const FINANCIAL_DRAFT_ACTION_TYPES = [
    'ALLOCATE_FUNDS',
    'TRANSFER_FUNDS',
    'SWAP_FUNDS',
    'INVEST_FUNDS',
] as const;

export type FinancialAgentPreset = typeof FINANCIAL_AGENT_PRESETS[number];

export interface KnownRecipientInput {
    label: string;
    address: string;
    chain: string;
}

const numericStringSchema = z.string().trim().regex(/^\d+(\.\d+)?$/, 'Must be a numeric string');

const policyConditionSchema = z.object({
    field: z.string().min(1),
    op: z.enum(['eq', 'gt', 'gte', 'lt', 'lte', 'in']),
    value: z.unknown(),
});

const allocateTransferSchema = z.object({
    kind: z.literal('transfer'),
    percentage: z.number().min(0).max(100),
    to: z.string().min(1),
    asset: z.string().min(1).optional(),
    chain: z.string().min(1).optional(),
    label: z.string().min(1).optional(),
});

const allocateSwapSchema = z.object({
    kind: z.literal('swap'),
    percentage: z.number().min(0).max(100),
    toAsset: z.string().min(1),
    fromAsset: z.string().min(1).optional(),
    chain: z.string().min(1).optional(),
    strategy: z.string().min(1).optional(),
    label: z.string().min(1).optional(),
});

const allocateFundsActionSchema = z.object({
    type: z.literal('ALLOCATE_FUNDS'),
    config: z.object({
        allocations: z.array(z.union([allocateTransferSchema, allocateSwapSchema])).min(1),
    }).superRefine((config, ctx) => {
        const total = config.allocations.reduce((acc, allocation) => acc + allocation.percentage, 0);
        if (Math.abs(total - 100) > 1e-9) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'ALLOCATE_FUNDS percentages must sum to 100',
            });
        }
    }),
});

const transferFundsActionSchema = z.object({
    type: z.literal('TRANSFER_FUNDS'),
    config: z.object({
        to: z.string().min(1),
        amount: z.string().min(1),
        asset: z.string().min(1),
        chain: z.string().min(1),
        label: z.string().min(1).optional(),
    }),
});

const swapFundsActionSchema = z.object({
    type: z.literal('SWAP_FUNDS'),
    config: z.object({
        amount: z.string().min(1),
        fromAsset: z.string().min(1),
        toAsset: z.string().min(1),
        chain: z.string().min(1),
        strategy: z.string().min(1).optional(),
        label: z.string().min(1).optional(),
    }),
});

const investFundsActionSchema = z.object({
    type: z.literal('INVEST_FUNDS'),
    config: z.object({
        strategy: z.string().min(1),
        amount: z.string().min(1),
        asset: z.string().min(1),
        chain: z.string().min(1),
        label: z.string().min(1).optional(),
    }),
});

const draftPolicyActionSchema = z.union([
    allocateFundsActionSchema,
    transferFundsActionSchema,
    swapFundsActionSchema,
    investFundsActionSchema,
]);

export const draftPolicySchema = z.object({
    trigger: z.enum(FINANCIAL_DRAFT_EVENT_TYPES),
    conditions: z.array(policyConditionSchema),
    actions: z.array(draftPolicyActionSchema).min(1),
    priority: z.number().int().min(1).optional(),
});

export const draftFinancialAgentInputSchema = z.object({
    agent: z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        subscribedEvents: z.array(z.enum(FINANCIAL_DRAFT_EVENT_TYPES)).min(1),
        permissionConfig: z.object({
            maxSpendPerTx: numericStringSchema.optional(),
            maxSpendPerMonth: numericStringSchema.optional(),
            allowedAssets: z.array(z.string().min(1)).optional(),
            allowedChains: z.array(z.string().min(1)).optional(),
            blockedAssets: z.array(z.string().min(1)).optional(),
            blockedChains: z.array(z.string().min(1)).optional(),
            allowedRecipients: z.array(z.string().min(1)).optional(),
            blockedRecipients: z.array(z.string().min(1)).optional(),
            allowedActions: z.array(z.enum(FINANCIAL_DRAFT_ACTION_TYPES)).optional(),
            blockedActions: z.array(z.enum(FINANCIAL_DRAFT_ACTION_TYPES)).optional(),
        }),
        approvalConfig: z.object({
            requireApprovalAbove: numericStringSchema.optional(),
            requireApprovalForNewRecipients: z.boolean().optional(),
            requireApprovalForInvestments: z.boolean().optional(),
            requireApprovalForSwaps: z.boolean().optional(),
        }),
    }),
    policies: z.array(draftPolicySchema).min(1),
    assumptions: z.array(z.string().min(1)).optional(),
});

export type DraftFinancialAgentInput = z.infer<typeof draftFinancialAgentInputSchema>;
export type DraftPolicyInput = z.infer<typeof draftPolicySchema>;

export const FinancialAgentValidationService = {
    validateDraft(draft: DraftFinancialAgentInput): DraftFinancialAgentInput {
        const parsed = draftFinancialAgentInputSchema.parse(draft);
        const blocked = new Set(parsed.agent.permissionConfig.blockedActions || []);

        if (blocked.size > 0 && parsed.agent.permissionConfig.allowedActions) {
            parsed.agent.permissionConfig.allowedActions = parsed.agent.permissionConfig.allowedActions
                .filter((action) => !blocked.has(action));
        }

        return parsed;
    },
};
