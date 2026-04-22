// ai.service.ts
import { Readable } from 'stream';
import { AIFactory } from '../../infrastructure/ai/factory';
import { CompletionRequest } from '../../infrastructure/ai/types';
import { AgentRepository } from '../agents/agent.repository';
import { getSpecializedSystemPrompt } from '../../core/engine/processors/prompts';
import { generateRandomBalance } from '../../core/engine/simulators/crypto/helpers';
import { ENV } from '../../shared/config/environments';

export const AiService = {
    async testConnection(provider: string, apiKey?: string, baseUrl?: string) {
    // For Anthropic, the "apiKey" we are using is actually an auth token
    let finalAuthToken = apiKey;
    let finalBaseUrl = baseUrl;
    
    // If no token provided, try to get from environment
    if (!finalAuthToken) {
        if (provider.toLowerCase() === 'anthropic') {
            finalAuthToken = ENV.ANTHROPIC_AUTH_TOKEN || ENV.ANTHROPIC_API_KEY;
            finalBaseUrl = finalBaseUrl || ENV.ANTHROPIC_BASE_URL;
        } else {
            finalAuthToken = this.getDefaultApiKey(provider) as string;
            finalBaseUrl = finalBaseUrl || this.getDefaultBaseUrl(provider);
        }
    }
    
    if (!finalAuthToken && provider !== 'ollama') {
        throw Object.assign(new Error(`Auth token/API Key is required for ${provider}. Either pass it or set ${provider.toUpperCase()}_AUTH_TOKEN in env`), { code: 400 });
    }

    const aiProvider = AIFactory.getProvider(provider);
    // Pass the auth token as apiKey (the provider will handle it)
    const success = await aiProvider.testConnection(finalAuthToken, finalBaseUrl);

    if (!success) {
        throw new Error(`Connection test failed for ${provider}. Please check your auth token/API key.`);
    }

    return { success: true, message: `Connection successful! ${provider} API is working.` };
},

    async generateCompletion(reqBody: CompletionRequest, headersApiKey?: string) {
        const providerName = reqBody.provider || ENV.DEFAULT_AI_PROVIDER || 'openai';
        
        // Use priority: request body apiKey > header apiKey > system env
        const apiKey = reqBody.apiKey || headersApiKey || this.getDefaultApiKey(providerName);
        const baseUrl = reqBody.baseUrl || this.getDefaultBaseUrl(providerName);
        const model = reqBody.model || this.getDefaultModel(providerName);

        const aiProvider = AIFactory.getProvider(providerName);
        return aiProvider.generateCompletion({
            ...reqBody,
            model,
            apiKey,
            baseUrl
        });
    },

    async generateStream(reqBody: CompletionRequest & { agentId?: string }, headersApiKey?: string) {
        const providerName = reqBody.provider || ENV.DEFAULT_AI_PROVIDER || 'openai';
        
        // Use priority: request body apiKey > header apiKey > system env
        const apiKey = reqBody.apiKey || headersApiKey || this.getDefaultApiKey(providerName);
        const baseUrl = reqBody.baseUrl || this.getDefaultBaseUrl(providerName);
        const model = reqBody.model || this.getDefaultModel(providerName);
        const agentId = reqBody.agentId;

        const aiProvider = AIFactory.getProvider(providerName);

        if (!aiProvider.generateStream) {
            throw new Error(`Provider ${providerName} does not support streaming yet.`);
        }

        let messages = [...(reqBody.messages || [])];

        // If agentId is provided, inject specialized domain prompt
        if (agentId) {
            const agent = await AgentRepository.findById(agentId);
            if (agent) {
                let walletContext = '';

                // Proactive balance fetch for financial agents
                if (agent.agentType === 'financial_agent' || (agent as any).character?.agent_type === 'financial_agent') {
                    const wallets = (agent as any).blockchain || [];

                    if (wallets.length > 0) {
                        walletContext += '\nYOUR PERMANENT BALANCES:';
                        wallets.forEach((w: any) => {
                            const bal = generateRandomBalance(w.network);
                            walletContext += `\n- ${w.network} (${w.walletAddress}): ${bal} CKB`;
                        });
                    }

                    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
                    if (lastUserMsg) {
                        const ckbRegex = /(ckt|ckb)1[0-9a-z]{38,}/gi;
                        const matches = lastUserMsg.content.match(ckbRegex);
                        if (matches && matches.length > 0) {
                            walletContext += '\n\nDETECTED ADDRESS BALANCES (LIVE):';
                            matches.forEach(addr => {
                                const bal = generateRandomBalance('ckb-testnet');
                                walletContext += `\n- ${addr}: ${bal} CKB`;
                            });
                        }
                    }
                }

                if (walletContext) {
                    walletContext = `LIVE BLOCKCHAIN DATA (Injecting for accuracy):\n${walletContext.trim()}`;
                }

                const specializedPrompt = getSpecializedSystemPrompt(agent, walletContext);

                const systemIdx = messages.findIndex(m => m.role === 'system');
                if (systemIdx !== -1) {
                    messages[systemIdx].content = specializedPrompt;
                } else {
                    messages.unshift({ role: 'system', content: specializedPrompt });
                }
            }
        }

        return aiProvider.generateStream({
            ...reqBody,
            model,
            messages,
            apiKey,
            baseUrl
        });
    },

    // Helper methods to get system defaults
getDefaultApiKey(provider: string): string | undefined {
    const providerLower = provider.toLowerCase();
    switch (providerLower) {
        case 'openai':
            return ENV.OPENAI_API_KEY;
        case 'gemini':
            return ENV.GEMINI_API_KEY;
        case 'ollama':
            return ENV.OLLAMA_API_KEY;
        case 'anthropic':
            // Prefer AUTH_TOKEN over API_KEY for custom endpoint
            return ENV.ANTHROPIC_AUTH_TOKEN || ENV.ANTHROPIC_API_KEY;
        default:
            return undefined;
    }
},

getDefaultBaseUrl(provider: string): string | undefined {
    const providerLower = provider.toLowerCase();
    switch (providerLower) {
        case 'openai':
            return ENV.OPENAI_BASE_URL;
        case 'gemini':
            return ENV.GEMINI_BASE_URL;
        case 'ollama':
            return ENV.OLLAMA_BASE_URL;
        case 'anthropic':
            return ENV.ANTHROPIC_BASE_URL;
        default:
            return undefined;
    }
},

getDefaultModel(provider: string): string | undefined {
    const providerLower = provider.toLowerCase();
    switch (providerLower) {
        case 'openai':
            return ENV.OPENAI_MODEL;
        case 'gemini':
            return ENV.GEMINI_MODEL;
        case 'ollama':
            return ENV.OLLAMA_MODEL;
        case 'anthropic':
            return ENV.ANTHROPIC_MODEL;
        default:
            return undefined;
    }
}
}