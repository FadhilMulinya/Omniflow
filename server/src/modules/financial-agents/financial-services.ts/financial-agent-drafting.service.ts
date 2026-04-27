import { AiService } from '../../ai/ai.service';
import {
  DraftFinancialAgentInput,
  FinancialAgentPreset,
  FINANCIAL_AGENT_PRESETS,
  draftFinancialAgentInputSchema,
} from './financial-agent-validation.service';
import { buildFinancialAgentDraftPrompt } from './financial-agent-drafting.prompt';

function buildFallbackDraft(input: {
  name: string;
  prompt: string;
  preset: FinancialAgentPreset;
}): DraftFinancialAgentInput {
  return {
    agent: {
      name: input.name,
      description: input.prompt,
      subscribedEvents: ['FUNDS.RECEIVED'],
      permissionConfig: {
        allowedChains: ['CKB'],
        allowedActions: ['ALLOCATE_FUNDS', 'TRANSFER_FUNDS', 'SWAP_FUNDS', 'INVEST_FUNDS'],
      },
      approvalConfig: {
        fallbackRequireApprovalForNewRecipients: input.preset === 'conservative_treasury',
        fallbackRequireApprovalForInvestments: input.preset !== 'aggressive_allocator',
        fallbackRequireApprovalForSwaps: input.preset !== 'aggressive_allocator',
      },
      networkConfigs: [
        {
          network: 'CKB',
          enabled: true,
          allowedAssets: ['CKB'],
          allowedActions: ['ALLOCATE_FUNDS', 'TRANSFER_FUNDS', 'SWAP_FUNDS', 'INVEST_FUNDS'],
          recipientPolicy: 'all',
          assetLimits: [
            {
              asset: 'CKB',
              requireApprovalForNewRecipients: input.preset === 'conservative_treasury',
              requireApprovalForInvestments: input.preset !== 'aggressive_allocator',
              requireApprovalForSwaps: input.preset !== 'aggressive_allocator',
            },
          ],
        },
      ],
    },
    policies: [
      {
        trigger: 'FUNDS.RECEIVED',
        conditions: [],
        actions: [
          {
            type: 'ALLOCATE_FUNDS',
            config: {
              allocations: [
                {
                  kind: 'retain',
                  percentage: 100,
                  label: 'Retain funds in managed wallet',
                },
              ],
            },
          },
        ],
        priority: 1,
      },
    ],
    assumptions: [
      'Created with a safe fallback draft because AI drafting was unavailable.',
      'Funds are retained in the managed wallet until a more specific policy is configured.',
    ],
  };
}

function extractBalancedJsonObjects(text: string): string[] {
  const objects: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      if (depth === 0) start = i;
      depth += 1;
      continue;
    }

    if (char === '}') {
      if (depth === 0) continue;
      depth -= 1;
      if (depth === 0 && start !== -1) {
        objects.push(text.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects;
}

function collectJsonCandidates(text: string): string[] {
  const candidates: string[] = [];
  const trimmed = text.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    candidates.push(trimmed);
  }

  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(text)) !== null) {
    const body = (match[1] || '').trim();
    if (body) candidates.push(body);
  }

  candidates.push(...extractBalancedJsonObjects(text));

  return [...new Set(candidates)].sort((a, b) => b.length - a.length);
}

function parseDraftFromModelOutput(content: string): DraftFinancialAgentInput {
  const candidates = collectJsonCandidates(content);

  if (candidates.length === 0) {
    throw { code: 400, message: 'Drafting model did not return JSON content' };
  }

  let validationError: string | undefined;

  for (const candidate of candidates) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(candidate);
    } catch {
      continue;
    }

    const result = draftFinancialAgentInputSchema.safeParse(parsed);
    if (result.success) {
      return result.data;
    }

    if (!validationError) {
      validationError = result.error.issues[0]?.message;
    }
  }

  throw {
    code: 400,
    message: validationError || 'Drafting model returned invalid JSON',
  };
}

export const FinancialAgentDraftingService = {
  async draftFromPrompt(input: {
    name: string;
    prompt: string;
    preset?: FinancialAgentPreset;
  }): Promise<DraftFinancialAgentInput> {
    if (!input.prompt?.trim()) {
      throw { code: 400, message: 'Prompt is required' };
    }

    const preset =
      input.preset && FINANCIAL_AGENT_PRESETS.includes(input.preset)
        ? input.preset
        : 'balanced_allocator';

    try {
      const completion = await AiService.generateCompletion({
        messages: [
          {
            role: 'user',
            content: buildFinancialAgentDraftPrompt({
              name: input.name,
              prompt: input.prompt,
              preset,
            }),
          },
        ],
        temperature: 0.1,
      });

      const draft = parseDraftFromModelOutput(completion.content || '');
      draft.agent.name = input.name;
      return draft;
    } catch (err: any) {
      console.warn('[FinancialAgentDraftingService] AI draft failed, using fallback draft:', err?.message || err);
      return buildFallbackDraft({
        name: input.name,
        prompt: input.prompt,
        preset,
      });
    }
  },
};
