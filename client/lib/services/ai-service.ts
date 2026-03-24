/**
 * Client-side AI Service for backend-powered execution
 */
import { apiFetch } from "../api-client";

export interface AIService {
    generateText(prompt: string, options?: any): Promise<any>;
    isConfigured(): boolean;
}

export class BackendAIService implements AIService {
    private provider: string;

    constructor(provider: string = 'gemini') {
        this.provider = provider.toLowerCase();
    }

    isConfigured(): boolean {
        // The backend handles configuration checks and fallbacks
        return true;
    }

    async generateText(prompt: string, options?: any): Promise<any> {
        const model = options?.model;
        const character = options?.character;
        const temperature = options?.temperature ?? 0.7;
        const maxTokens = options?.maxTokens ?? 1000;

        const response = await apiFetch('/ai/complete', {
            method: 'POST',
            body: JSON.stringify({
                provider: this.provider,
                model: model,
                messages: [{ role: 'user', content: prompt }],
                character,
                temperature,
                maxTokens,
            })
        });

        return {
            text: response.content,
            model: response.model,
            usage: {
                prompt_tokens: response.usage?.promptTokens || 0,
                completion_tokens: response.usage?.completionTokens || 0,
                total_tokens: response.usage?.totalTokens || 0,
            },
            created: Date.now(),
        };
    }
}

export const getBestAvailableAIService = (provider: string = 'gemini'): AIService => {
    return new BackendAIService(provider);
};
