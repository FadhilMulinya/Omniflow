import {
    IAIProvider,
    CompletionRequest,
    CompletionResponse
} from '../types';
import { buildSystemPrompt } from '../utils';

export class GeminiProvider implements IAIProvider {
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    private defaultModel = 'gemini-1.5-flash';

    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
        const apiKey = request.apiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error('Gemini API key is missing. Please provide one in the request or configure it on the server.');
        }

        const model = request.model || this.defaultModel;
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${apiKey}`;

        let systemInstruction = '';
        if (request.character) {
            systemInstruction = buildSystemPrompt(request.character);
        }

        const contents = request.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const requestBody: any = {
            contents,
            generationConfig: {
                temperature: request.temperature ?? 0.7,
                maxOutputTokens: request.maxTokens,
            }
        };

        if (systemInstruction) {
            requestBody.system_instruction = {
                parts: [{ text: systemInstruction }]
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${JSON.stringify(errorData.error)}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        return {
            content,
            usage: {
                promptTokens: data.usageMetadata?.promptTokenCount || 0,
                completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
                totalTokens: data.usageMetadata?.totalTokenCount || 0,
            },
            model: model,
            provider: 'gemini',
        };
    }

    async testConnection(apiKey: string): Promise<boolean> {
        try {
            const url = `${this.baseUrl}/models/${this.defaultModel}?key=${apiKey}`;
            const response = await fetch(url);
            return response.ok;
        } catch (error) {
            console.error('Gemini connection test failed:', error);
            return false;
        }
    }
}
