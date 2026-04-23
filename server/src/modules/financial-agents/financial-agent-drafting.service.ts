import { AiService } from '../ai/ai.service';
import {
  DraftFinancialAgentInput,
  FinancialAgentPreset,
  FINANCIAL_AGENT_PRESETS,
  KnownRecipientInput,
  draftFinancialAgentInputSchema,
} from './financial-agent-validation.service';

function buildPrompt(input: {
  prompt: string;
  preset?: FinancialAgentPreset;
  knownRecipients?: KnownRecipientInput[];
}) {
  const preset = input.preset && FINANCIAL_AGENT_PRESETS.includes(input.preset)
    ? input.preset
    : 'balanced_allocator';

  return `You are a financial agent configuration designer.

Your job is to convert a user's plain-English request into a strict JSON configuration for an event-driven financial automation agent.

You are NOT designing a character or persona.
You are designing:
- runtime subscriptions
- permissions
- approval rules
- financial policies

Return valid JSON only.
Do not include markdown.
Do not include explanations outside the JSON.

The JSON must follow this exact shape:
{
  "agent": {
    "name": "string",
    "description": "string",
    "subscribedEvents": ["FUNDS.RECEIVED" | "TIME.MONTH_STARTED" | "APPROVAL.GRANTED" | "APPROVAL.REJECTED"],
    "permissionConfig": {
      "maxSpendPerTx": "string?",
      "maxSpendPerMonth": "string?",
      "allowedAssets": ["string"]?,
      "allowedChains": ["string"]?,
      "blockedAssets": ["string"]?,
      "blockedChains": ["string"]?,
      "allowedRecipients": ["string"]?,
      "blockedRecipients": ["string"]?,
      "allowedActions": ["ALLOCATE_FUNDS" | "TRANSFER_FUNDS" | "SWAP_FUNDS" | "INVEST_FUNDS"]?,
      "blockedActions": ["ALLOCATE_FUNDS" | "TRANSFER_FUNDS" | "SWAP_FUNDS" | "INVEST_FUNDS"]?
    },
    "approvalConfig": {
      "requireApprovalAbove": "string?",
      "requireApprovalForNewRecipients": "boolean?",
      "requireApprovalForInvestments": "boolean?",
      "requireApprovalForSwaps": "boolean?"
    }
  },
  "policies": [
    {
      "trigger": "FUNDS.RECEIVED" | "TIME.MONTH_STARTED" | "APPROVAL.GRANTED" | "APPROVAL.REJECTED",
      "conditions": [
        {
          "field": "string",
          "op": "eq" | "gt" | "gte" | "lt" | "lte" | "in",
          "value": "any"
        }
      ],
      "actions": [
        {
          "type": "ALLOCATE_FUNDS",
          "config": {
            "allocations": [
              {
                "kind": "transfer",
                "percentage": 0,
                "to": "string",
                "asset": "string?",
                "chain": "string?",
                "label": "string?"
              },
              {
                "kind": "swap",
                "percentage": 0,
                "toAsset": "string",
                "fromAsset": "string?",
                "chain": "string?",
                "strategy": "string?",
                "label": "string?"
              }
            ]
          }
        },
        {
          "type": "TRANSFER_FUNDS",
          "config": {
            "to": "string",
            "amount": "string",
            "asset": "string",
            "chain": "string",
            "label": "string?"
          }
        },
        {
          "type": "SWAP_FUNDS",
          "config": {
            "amount": "string",
            "fromAsset": "string",
            "toAsset": "string",
            "chain": "string",
            "strategy": "string?",
            "label": "string?"
          }
        },
        {
          "type": "INVEST_FUNDS",
          "config": {
            "strategy": "string",
            "amount": "string",
            "asset": "string",
            "chain": "string",
            "label": "string?"
          }
        }
      ],
      "priority": 1
    }
  ],
  "assumptions": ["string"]
}

Rules:
1. Prefer "FUNDS.RECEIVED" when the user describes reacting to incoming money.
2. Prefer "TIME.MONTH_STARTED" when the user describes monthly automation.
3. Use "ALLOCATE_FUNDS" when the user describes splitting funds into multiple destinations or actions.
4. If the user mentions a chain like CKB, put it in allowedChains.
5. If the user mentions assets like CKB or USDC, include them in allowedAssets.
6. If the user provides wallet addresses, use them directly.
7. If a recipient label matches a known recipient, resolve it to the provided address.
8. If the user mentions approval thresholds, put them in approvalConfig.
9. Percentages inside one ALLOCATE_FUNDS action must sum to 100.
10. Be conservative. Do not invent risky permissions.
11. If something is unclear, include a short note in "assumptions" rather than making wild guesses.

Preset behavior:
- conservative_treasury: stronger approval defaults, tighter permissions
- balanced_allocator: normal approval defaults
- aggressive_allocator: fewer approval requirements, still keep valid permissions

Known recipients:
${JSON.stringify(input.knownRecipients || [])}

Preset:
${preset}

User request:
${input.prompt}`;
}

function extractJsonObject(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw { code: 400, message: 'Drafting model did not return valid JSON content' };
  }
  return text.slice(start, end + 1);
}

export const FinancialAgentDraftingService = {
  async draftFromPrompt(input: {
    prompt: string;
    preset?: FinancialAgentPreset;
    knownRecipients?: KnownRecipientInput[];
  }): Promise<DraftFinancialAgentInput> {
    if (!input.prompt?.trim()) {
      throw { code: 400, message: 'Prompt is required' };
    }

    const completion = await AiService.generateCompletion({
      messages: [{ role: 'user', content: buildPrompt(input) }],
      temperature: 0.1,
    });

    const jsonString = extractJsonObject(completion.content || '');

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw { code: 400, message: 'Drafting model returned invalid JSON' };
    }

    const result = draftFinancialAgentInputSchema.safeParse(parsed);
    if (!result.success) {
      throw { code: 400, message: result.error.issues[0]?.message || 'Invalid drafted configuration' };
    }

    return result.data;
  },
};
