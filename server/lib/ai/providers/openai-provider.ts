import OpenAI from 'openai';
import {
    IAIProvider,
    CompletionRequest,
    CompletionResponse
} from '../types';
import { buildSystemPrompt } from '../utils';

export class OpenAIProvider implements IAIProvider {
    private defaultModel = 'gpt-4o';

    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
        const apiKey = request.apiKey || process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('OpenAI API key is missing. Please provide one in the request or configure it on the server.');
        }

        const client = new OpenAI({ apiKey });

        const model = request.model || this.defaultModel;
        const messages: any[] = [...request.messages];

        if (request.character && request.character.instructions && request.character.instructions.length > 0) {
            const systemPrompt = buildSystemPrompt(request.character);
            messages.unshift({ role: 'system', content: systemPrompt });
        }

        const completion = await client.chat.completions.create({
            model: model,
            messages: messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens,
        });

        const content = completion.choices[0]?.message?.content || '';

        return {
            content,
            usage: {
                promptTokens: completion.usage?.prompt_tokens || 0,
                completionTokens: completion.usage?.completion_tokens || 0,
                totalTokens: completion.usage?.total_tokens || 0,
            },
            model: model,
            provider: 'openai',
        };
    }

    async testConnection(apiKey: string): Promise<boolean> {
        try {
            const client = new OpenAI({ apiKey });
            await client.models.list();
            return true;
        } catch (error) {
            console.error('OpenAI connection test failed:', error);
            return false;
        }
    }
}
