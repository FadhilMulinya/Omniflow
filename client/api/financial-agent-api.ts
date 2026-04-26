import { apiFetch } from './api-client';

export type FinancialAgentPreset =
    | 'conservative_treasury'
    | 'balanced_allocator'
    | 'aggressive_allocator';

const FINANCIAL_AGENT_PRESETS: FinancialAgentPreset[] = [
    'conservative_treasury',
    'balanced_allocator',
    'aggressive_allocator',
];

function normalizePreset(preset?: string): FinancialAgentPreset | undefined {
    if (!preset) return undefined;
    if ((FINANCIAL_AGENT_PRESETS as string[]).includes(preset)) return preset as FinancialAgentPreset;

    const legacyMap: Record<string, FinancialAgentPreset> = {
        conservative: 'conservative_treasury',
        custom: 'balanced_allocator',
        balanced: 'balanced_allocator',
        aggressive: 'aggressive_allocator',
    };

    return legacyMap[preset];
}

export const financialAgentApi = {
    draftFromPrompt: async (name: string, prompt: string, preset?: string) => {
        const body: {
            mode: 'prompt';
            name: string;
            prompt: string;
            preset?: FinancialAgentPreset;
        } = { mode: 'prompt', name, prompt };
        const normalizedPreset = normalizePreset(preset);
        if (normalizedPreset) body.preset = normalizedPreset;

        return apiFetch('/financial-agents/draft', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    createFromStructured: async (draft: any) =>
        apiFetch('/financial-agents', {
            method: 'POST',
            body: JSON.stringify({ mode: 'structured', draft }),
        }),

    listAgents: async () => apiFetch('/financial-agents'),

    getAgent: async (id: string) => apiFetch(`/financial-agents/${id}`),

    pauseAgent: async (id: string) =>
        apiFetch(`/financial-agents/${id}/pause`, { method: 'POST', body: JSON.stringify({}) }),

    activateAgent: async (id: string) =>
        apiFetch(`/financial-agents/${id}/activate`, { method: 'POST', body: JSON.stringify({}) }),
    
    getWorkspaceEvents: async () => apiFetch('/financial-agents/events'),
    
    getAgentEvents: async (id: string) => apiFetch(`/financial-agents/${id}/events`),
};
