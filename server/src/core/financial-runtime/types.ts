export const FINANCIAL_EVENT_TYPES = [
  'PAYMENT_LINK.PAID',
  'FUNDS.RECEIVED',
  'TIME.MONTH_STARTED',
  'APPROVAL.GRANTED',
  'APPROVAL.REJECTED',
  'PAYMENT_LINK.CREATED',
  'PAYMENT_LINK.UPDATED',
  'PAYMENT_LINK.DELETED',
  'FUNDS.TRANSFERRED',
  'FUNDS.INVESTED',
  'FUNDS.RESERVED',
  'FUNDS.LIQUIDATED',
  'FUNDS.WITHDRAWN',
  'FUNDS.DEPOSITED',
  'FUNDS.SWAPPED',
  'FUNDS.STAKED',
  'FUNDS.UNSTAKED',
  'TRANSACTION.COMPLETED',
  'TRANSACTION.FAILED',
  'TRANSACTION.PENDING',
] as const;

export type FinancialEventType = typeof FINANCIAL_EVENT_TYPES[number];

export const FINANCIAL_POLICY_ACTION_TYPES = [
  'SPLIT_FUNDS',
  'TRANSFER_FUNDS',
  'INVEST_FUNDS',
  'REQUEST_APPROVAL',
] as const;

export type FinancialPolicyActionType = typeof FINANCIAL_POLICY_ACTION_TYPES[number];

export type FinancialAgentStatus = 'active' | 'paused';

export interface FinancialEventPayload {
  [key: string]: unknown;
}

export interface RuntimeEvent {
  id: string;
  type: FinancialEventType;
  workspaceId: string;
  agentId?: string;
  source: string;
  payload: FinancialEventPayload;
  createdAt: number;
}

export interface PolicyCondition {
  field: string;
  op: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
  value: unknown;
}

export type PolicyAction =
  | {
    type: 'SPLIT_FUNDS';
    config: {
      reservePct: number;
      investPct: number;
      liquidPct: number;
      asset?: string;
      chain?: string;
    };
  }
  | {
    type: 'TRANSFER_FUNDS';
    config: {
      to: string;
      amount: string;
      asset: string;
      chain: string;
    };
  }
  | {
    type: 'INVEST_FUNDS';
    config: {
      strategy: string;
      amount: string;
      asset: string;
      chain: string;
    };
  }
  | {
    type: 'REQUEST_APPROVAL';
    config: {
      reason: string;
    };
  };

export interface MatchedPolicy {
  policyId: string;
  priority: number;
  actions: PolicyAction[];
}

export interface PermissionConfig {
  maxSpendPerTx?: string;
  maxSpendPerMonth?: string;
  maxSpendPerWeek?: string;
  maxSpendPerDay?: string;
  allowedAssets?: string[];
  allowedChains?: string[];
  blockedAssets?: string[];
  blockedChains?: string[];
  blockedRecipients?: string[];
  allowedRecipients?: string[];
  allowedActions?: PolicyAction['type'][];
  blockedActions?: PolicyAction['type'][];
}

export interface ApprovalConfig {
  requireApprovalAbove?: string;
  requireApprovalForNewRecipients?: boolean;
  requireApprovalForInvestments?: boolean;
}
