/**
 * Frontend mirror of the server NodeOutput<T> envelope.
 * Used in node components and NodeOutputDisplay to read execution results.
 */

export interface NodeMetadata {
  executionMs?: number;
  toolVersion?: string;
  modelUsed?: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
  network?: string;
  toolName?: string;
}

export interface NodeOutput<T extends object = Record<string, unknown>> {
  result: T;
  status: 'success' | 'error';
  confidence: number;
  timestamp: string;
  request_id: string;
  message?: string;
  metadata?: NodeMetadata;
}

// ─── Per-node result types (mirrors server contracts) ─────────────────────────

export interface InputNodeResult {
  value: string | number | boolean | Record<string, unknown>;
  inputType: 'text' | 'file' | 'webhook';
  label: string;
}

export interface OutputNodeResult {
  displayText: string;
  format: 'Plain' | 'Markdown' | 'HTML';
  finalData: Record<string, unknown>;
}

export interface ApiCallResult {
  response: unknown;
  statusCode: number;
  headers: Record<string, string>;
}

export interface AiProcessorResult {
  response: string;
  model: string;
  tokenUsage?: { prompt: number; completion: number; total: number };
}

export interface FinancialProcessorResult {
  intent: string;
  message: string;
  amount?: number | string;
  address?: string;
  parameters: Record<string, unknown>;
}

export interface SocialProcessorResult {
  intent: string;
  tone: string;
  message: string;
  analysis: Record<string, unknown>;
}

export interface OperationalProcessorResult {
  intent: string;
  task: string;
  schedule: string;
  message: string;
  plan: Record<string, unknown>;
}

export interface GeneralProcessorResult {
  intent: string;
  message: string;
  raw: Record<string, unknown>;
}

export interface BlockchainNodeResult {
  data: unknown;
  network: string;
  toolName: string;
  txHash?: string;
}

export interface CryptoWalletResult {
  connected: boolean;
  address: string;
  network: string;
  currency: string;
  balance: number;
  connectionType: string;
  lastUpdated: string;
}

export interface CryptoTradeResult {
  transactionId: string;
  action: string;
  token: string;
  amount: number;
  price: string;
  total: number;
  wallet: string;
  network: string;
  executedAt: string;
}

export interface TelegramResult {
  messageId: number;
  chatId: string | number;
  sentAt: string;
}

export interface A2ANodeResult {
  messageId: string;
  recipientAgentId: string;
  performative: string;
  delivered: boolean;
  conversationId?: string;
  status: 'delivered' | 'failed';
}

export interface ConditionNodeResult {
  conditionResult: boolean;
  matchedBranch?: string;
  [branchKey: string]: unknown;
}

/**
 * Safely extract the result payload from a NodeOutput envelope.
 * Handles both the new envelope format (v2.0) and legacy flat format (v1.0).
 */
export function getNodeResult<T extends Record<string, unknown>>(
  outputData: NodeOutput<T> | Record<string, unknown> | null | undefined
): T | Record<string, unknown> | null {
  if (!outputData) return null;
  // New envelope format: has both result and status fields
  if ('result' in outputData && 'status' in outputData && 'request_id' in outputData) {
    return (outputData as NodeOutput<T>).result;
  }
  // Legacy flat format
  return outputData as Record<string, unknown>;
}

/** Returns true if the output is a v2 NodeOutput envelope */
export function isNodeOutput(val: unknown): val is NodeOutput<object> {
  return (
    typeof val === 'object' &&
    val !== null &&
    'result' in val &&
    'status' in val &&
    'request_id' in val
  );
}
