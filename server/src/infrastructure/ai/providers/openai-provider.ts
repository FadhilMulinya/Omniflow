// openai-provider.ts
import { OpenAIClient } from '../types';
import { IAIProvider, CompletionRequest, CompletionResponse } from '../types';
import { buildSystemPrompt } from '../utils';
import { ENV } from '../../../shared/config/environments';
import OpenAI from 'openai';

export class OpenAIProvider implements IAIProvider {
    private client = OpenAIClient;
    private defaultModel = ENV.OPENAI_MODEL || 'gpt-5.4';
    
    private buildMessages(request: CompletionRequest) {
        const messages = [...request.messages];
        if (request.character?.instructions?.length) {
            messages.unshift({ role: 'system', content: buildSystemPrompt(request.character) });
        }
        return messages;
    }

    async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
        const model = request.model || this.defaultModel;
        const client = request.apiKey || request.baseUrl
            ? new OpenAI({
                apiKey: request.apiKey || ENV.OPENAI_API_KEY,
                baseURL: request.baseUrl || ENV.OPENAI_BASE_URL,
            })
            : this.client;
        
        if (!request.apiKey && !ENV.OPENAI_API_KEY) {
            throw Object.assign(new Error('OpenAI API key is missing. Configure one on the server or save an OpenAI key in settings.'), { code: 400 });
        }

        const response = await client.responses.create({
            model: model,
            input: this.buildMessages(request) as any,
            temperature: request.temperature ?? 0.7,
            max_output_tokens: request.maxTokens,
        });

        // Extract text from the response output
        let content = '';
        if (response.output && response.output.length > 0) {
            const firstOutput = response.output[0];
            if (firstOutput.type === 'message' && firstOutput.content) {
                content = firstOutput.content.map((c: any) => c.text).join('');
            }
        }

        return {
            content: content,
            usage: {
                promptTokens: response.usage?.input_tokens || 0,
                completionTokens: response.usage?.output_tokens || 0,
                totalTokens: response.usage?.total_tokens || 0,
            },
            model: model,
            provider: 'openai',
        };
    }

    async *generateStream(request: CompletionRequest): AsyncIterableIterator<string> {
        const model = request.model || this.defaultModel;
        
        const stream = await this.client.responses.create({
            model: model,
            input: this.buildMessages(request) as any,
            stream: true,
            temperature: request.temperature ?? 0.7,
            max_output_tokens: request.maxTokens,
        });

        for await (const chunk of stream) {
            // Handle different chunk types from Responses API
            if (chunk.type === 'response.output_text.delta') {
                const text = chunk.delta;
                if (text) yield text;
            } else if (chunk.type === 'response.output_item.added') {
                // Skip item added events
                continue;
            } else if (chunk.type === 'response.content_part.added') {
                // Skip part added events
                continue;
            }
        }
    }

async testConnection(apiKey?: string, baseUrl?: string): Promise<boolean> {
    try {
        const finalApiKey = apiKey || ENV.OPENAI_API_KEY;
        const finalBaseUrl = baseUrl || ENV.OPENAI_BASE_URL;
        
        if (!finalApiKey) {
            console.error('No API key provided for OpenAI');
            return false;
        }
        
        const client = new OpenAI({
            apiKey: finalApiKey,
            baseURL: finalBaseUrl,
        });
        
        const response = await client.responses.create({
            model: ENV.OPENAI_MODEL || 'gpt-5.4',
            input: 'ok',
            max_output_tokens: 1,
        });
        
        console.log('✅ OpenAI connection successful');
        return true;
    } catch (error: any) {
        console.error('❌ OpenAI connection failed:', error.message);
        return false;
    }
}
}
