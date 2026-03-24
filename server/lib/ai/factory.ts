import { IAIProvider } from './types';
import { GeminiProvider } from './providers/gemini-provider';
import { OpenAIProvider } from './providers/openai-provider';

export class AIFactory {
    private static providers: Record<string, IAIProvider> = {
        gemini: new GeminiProvider(),
        openai: new OpenAIProvider(),
    };

    static getProvider(name: string): IAIProvider {
        const provider = this.providers[name.toLowerCase()];
        if (!provider) {
            throw new Error(`AI Provider "${name}" not found or not supported.`);
        }
        return provider;
    }

    static getAvailableProviders(): string[] {
        return Object.keys(this.providers);
    }
}
