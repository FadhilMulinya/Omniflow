import { apiFetch } from './api-client';

export const agentApi = {
    loadAgents: async () => {
        return apiFetch('/agents');
    },

    enhancePersona: async (name: string, persona: string, provider?: string, apiKey?: string, model?: string, agentType?: string) => {
        return apiFetch('/agents/enhance', {
            method: 'POST',
            body: JSON.stringify({ name, persona, provider, apiKey, model, agentType }),
        });
    },

    saveAgent: async (name: string, graph?: { nodes: any[]; edges: any[] }, persona?: string, description?: string, isDraft: boolean = true, provider?: string, apiKey?: string, character?: any, agentType?: string, chain?: string) => {
        return apiFetch('/agents', {
            method: 'POST',
            body: JSON.stringify({
                name,
                persona,
                description,
                graph,
                isDraft,
                provider,
                apiKey,
                character,
                agentType,
                chain
            }),
        });
    },

    updateAgent: async (id: string, updates: { name?: string; description?: string; persona?: string; graph?: { nodes: any[]; edges: any[] }; identities?: any; isDraft?: boolean; provider?: string; apiKey?: string; character?: any }) => {
        return apiFetch(`/agents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
    },
    // ...

    getAgent: async (id: string) => {
        return apiFetch(`/agents/${id}`);
    },

    deleteAgent: async (id: string) => {
        return apiFetch(`/agents/${id}`, {
            method: 'DELETE',
        });
    },

    getTemplates: async () => {
        return apiFetch('/templates');
    },

    createAgentFromTemplate: async (templateId: string, name: string, modelProvider?: string, modelName?: string, apiKey?: string) => {
        return apiFetch('/agents/from-template', {
            method: 'POST',
            body: JSON.stringify({ templateId, name, modelProvider, modelName, apiKey }),
        });
    },

    chatWithAgent: async (provider: string, model: string, messages: any[], apiKey?: string) => {
        return apiFetch('/ai/complete', {
            method: 'POST',
            body: JSON.stringify({ provider, model, messages, apiKey }),
        });
    },

    chatWithAgentStream: async (provider: string, model: string, messages: any[], apiKey?: string, agentId?: string) => {
        // We use raw fetch here because apiFetch handles the full JSON response, 
        // but for streaming we need the reader.
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '') + '/api';
        const url = `${baseUrl}/ai/stream`;

        const headers: any = { 'Content-Type': 'application/json' };
        const effectiveApiKey = apiKey || (typeof window !== 'undefined' ? localStorage.getItem(`${provider.toLowerCase()}_api_key`) : null);
        if (effectiveApiKey) headers['x-ai-api-key'] = effectiveApiKey;

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify({ provider, model, messages, agentId }),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'An error occurred' }));
            throw new Error(error.message || response.statusText);
        }

        return response.body?.getReader();
    },
};
