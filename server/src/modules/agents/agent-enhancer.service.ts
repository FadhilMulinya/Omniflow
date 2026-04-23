import { AIFactory } from '../../infrastructure/ai/factory';
import { ENV } from '../../shared/config/environments';
import { financialAgentSchema } from '../../core/characters/schemas/financial';

// ── Schema selection ─────────────────────────────────────────────────────────

function selectSchema(_agentType: string) {
    return financialAgentSchema;
}

// ── Chain constraint prompt fragment ─────────────────────────────────────────

function buildChainConstraint(chains: string[]): string {
    if (chains.length === 0) return '';
    return `
BLOCKCHAIN CONSTRAINTS (MANDATORY — embed these rules into the character's instructions and behaviour):
- This agent is authorised to operate EXCLUSIVELY on the following networks: ${chains.join(', ')}.
- The agent MUST NEVER initiate, sign, or relay transactions on any network not in that list.
- Before executing any transaction, the agent MUST verify that the target chain matches one of its authorised networks and explicitly confirm this to the user.
- If a user requests an action on an unauthorised chain, the agent must refuse and explain which chains it is permitted to use.
- These constraints are non-negotiable and must be reflected in the character's system instructions and allowed_actions fields.`;
}

// ── JSON extraction ──────────────────────────────────────────────────────────

function extractJson(raw: string): string {
    if (!raw.trim()) throw new Error('AI returned an empty response.');

    const blockMatch = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/```\s*([\s\S]*?)\s*```/);
    if (blockMatch?.[1]) return blockMatch[1];

    const startIdx = raw.indexOf('{');
    const endIdx = raw.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) return raw.substring(startIdx, endIdx + 1);

    throw new Error('Could not extract JSON from AI response.');
}

// ── Provider API key resolution ───────────────────────────────────────────────

function resolveApiKey(providerName: string, customApiKey?: string): string | undefined {
    if (customApiKey) return customApiKey;
    if (providerName === 'openai') return ENV.OPENAI_API_KEY;
    if (providerName === 'gemini') return ENV.GEMINI_API_KEY;
    if (providerName === 'ollama') return ENV.OLLAMA_BASE_URL;
    return undefined;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function enhancePersona(
    name: string,
    persona: string,
    providerName: string = 'ollama',
    customApiKey?: string,
    modelName?: string,
    agentType: string = 'operational_agent',
    chains: string[] = []
): Promise<any> {
    const provider = AIFactory.getProvider(providerName);
    const targetSchema = selectSchema(agentType);
    const chainConstraint = buildChainConstraint(chains);

    const prompt = `
You are an expert AI character designer for Onhandl, a decentralized agent platform.
Given an agent name, a summarized persona, and a strict target schema, expand the persona into a comprehensive character profile.

CRITICAL REQUIREMENT:
Your output MUST be a valid JSON object ONLY.
You MUST strictly conform to the provided JSON Schema below.
Fill out ALL strictly required fields thoroughly. For arrays of strings (like traits, allowed_actions, etc.), provide at least 3 thoughtful items.
${chainConstraint}
TARGET JSON SCHEMA:
${JSON.stringify(targetSchema, null, 2)}

Agent Name: ${name}
Agent Type: ${agentType}
Authorised Chains: ${chains.length > 0 ? chains.join(', ') : 'none specified — do not assume any chain'}
Summarized Persona: ${persona}
    `.trim();

    try {
        const response = await provider.generateCompletion({
            messages: [{ role: 'user', content: prompt }],
            provider: providerName as any,
            model: modelName,
            temperature: 0.8,
            apiKey: resolveApiKey(providerName, customApiKey),
        });

        const json = extractJson(response.content || '');
        const enhancedData = JSON.parse(json.trim());
        enhancedData.agent_type = agentType;
        return enhancedData;
    } catch (error: any) {
        const msg = error?.message || String(error);
        console.error('[enhancePersona] Failed:', msg);
        throw new Error(`Failed to expand persona using AI: ${msg}`);
    }
}

