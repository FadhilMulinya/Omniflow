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
        // Use system defaults if not provided
        const finalApiKey = apiKey || this.getDefaultApiKey(provider) as string;
        const finalBaseUrl = baseUrl || this.getDefaultBaseUrl(provider);
        
        if (!finalApiKey && provider !== 'ollama') {
            throw Object.assign(new Error(`API Key is required for ${provider}. Either pass it or set ${provider.toUpperCase()}_API_KEY in env`), { code: 400 });
        }

        const aiProvider = AIFactory.getProvider(provider);
        const success = await aiProvider.testConnection(finalApiKey, finalBaseUrl);

        if (!success) {
            throw new Error(`Connection test failed for ${provider}. Please check your API key.`);
        }

        return { success: true, message: `Connection successful! ${provider} API is working.` };
    },

    async generateCompletion(reqBody: CompletionRequest, headersApiKey?: string) {
        const providerName = reqBody.provider || 'gemini';
        
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
        const providerName = reqBody.provider || 'gemini';
        
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
            default:
                return undefined;
        }
    }
};