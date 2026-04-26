import { apiFetch } from './api-client';

export const financialAgentApi = {
    draftFromPrompt: async (name: string, prompt: string, preset?: string) =>
        apiFetch('/financial-agents/draft', {
            method: 'POST',
            body: JSON.stringify({ mode: 'prompt', name, prompt, preset }),
        }),

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
