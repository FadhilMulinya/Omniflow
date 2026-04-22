import { AgentRepository } from '../agent.repository';
import { enhancePersona } from '../agent-enhancer.service';
import { validateCharacter } from '../../../core/characters/validator';
import { generatePrivateKey, getAddress } from '../../../infrastructure/blockchain/ckb/ckb-specific-tools/ckb_wallet_tool';
import { Workspace } from '../../../infrastructure/database/models/Workspace';
import { User } from '../../../infrastructure/database/models/User';
import { resolveProviderKeys } from '../../../shared/utils/provider-utils';
import { getUserPlan, assertAgentLimit } from '../../../shared/utils/plan-enforcement';

interface CreateAgentParams {
    userId: string;
    name: string;
    description?: string;
    persona?: string;
    identities?: any;
    character?: any;
    isDraft?: boolean;
    agentType?: string;
    chains?: string[];
    log: (msg: string) => void;
}

export const AgentCreationService = {
    async createAgent(params: CreateAgentParams) {
        const { userId, name, description, persona, identities, character,
            isDraft, agentType = 'operational_agent', chains, log } = params;

        const [workspace, user, planId] = await Promise.all([
            Workspace.findOne({ ownerId: userId }),
            User.findById(userId).select('apiKeys').lean(),
            getUserPlan(userId),
        ]);
        if (!workspace) throw { code: 404, message: 'No workspace found' };

        const currentCount = await AgentRepository.count({ workspaceId: workspace._id });
        assertAgentLimit(planId, currentCount);

        const { provider, apiKey, model } = resolveProviderKeys((user as any)?.apiKeys);

        let finalCharacter = character || {};
        if (persona && (!finalCharacter.character?.bio || Object.keys(finalCharacter).length <= 1)) {
            const enhanced = await enhancePersona(name, persona, provider, apiKey, model, agentType, chains);
            if (!enhanced.character || !enhanced.identity) throw new Error('AI generated an incomplete character. Please try a more detailed persona summary.');
            finalCharacter = enhanced;
        }

        const validationResult = validateCharacter(agentType, finalCharacter);
        if (!validationResult.isValid) throw { code: 400, message: 'Character Schema Validation Failed', details: validationResult.errors };

        const agentData: Record<string, unknown> = {
            ownerId: userId, workspaceId: workspace._id, name, persona,
            description: description || finalCharacter.identity?.description || finalCharacter.character?.bio || '',
            identities: identities || {}, character: finalCharacter,
            agentType, modelProvider: provider, modelConfig: { modelName: model || 'qwen2.5:3b' },
            isDraft: isDraft ?? true,
        };

        const wallets: any[] = [];
        if (chains && chains.length > 0) {
            for (const chain of chains) {
                if (chain.toLowerCase() === 'ckb') {
                    try {
                        const privateKey = generatePrivateKey();
                        const address = await getAddress(privateKey);
                        wallets.push({
                            network: 'ckb',
                            walletAddress: address,
                            privateKey: privateKey,
                            walletType: 'managed'
                        });
                    } catch { log(`wallet gen failed for ${chain}`); }
                }
            }
        }
        if (wallets.length > 0) agentData.blockchain = wallets;

        const agent = await AgentRepository.create(agentData);
        await User.findByIdAndUpdate(userId, { $inc: { tokens: -300 } });
        return agent;
    },

    async previewEnhancePersona(
        name: string, persona: string, agentType: string = 'operational_agent',
        chains: string[] = [], userId?: string
    ) {
        let providerKeys = resolveProviderKeys({});
        if (userId) {
            const user = await User.findById(userId).select('apiKeys').lean();
            providerKeys = resolveProviderKeys((user as any)?.apiKeys);
        }
        return enhancePersona(name, persona, providerKeys.provider, providerKeys.apiKey, providerKeys.model, agentType, chains);
    }
};
