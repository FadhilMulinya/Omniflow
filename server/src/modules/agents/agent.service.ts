import mongoose from 'mongoose';
import { AgentRepository } from './agent.repository';
import { AgentTemplateService } from './agent-template.service';
import { enhancePersona } from './agent-enhancer.service';
import { validateCharacter } from '../../core/characters/validator';
import { WalletService } from '../../infrastructure/blockchain/wallet.service';
import { Purchase } from '../../infrastructure/database/models/Purchase';
import { Workspace } from '../../infrastructure/database/models/Workspace';
import { User } from '../../infrastructure/database/models/User';
import { PLANS, PlanId } from '../../shared/constants/tokens';
import { ENV } from '../../shared/config/environments';

// ── Provider resolution ───────────────────────────────────────────────────────

export function resolveProviderKeys(userApiKeys: any): { provider: string; apiKey?: string; model?: string } {
    const k = userApiKeys || {};
    if (k.gemini) return { provider: 'gemini', apiKey: k.gemini };
    if (k.openai) return { provider: 'openai', apiKey: k.openai, model: k.openaiModel || undefined };
    if (k.ollamaBaseUrl) return { provider: 'ollama', apiKey: k.ollamaBaseUrl, model: k.ollamaModel || 'qwen2.5:3b' };

    const def = ENV.DEFAULT_AI_PROVIDER;
    if (def === 'gemini' && ENV.GEMINI_API_KEY) return { provider: 'gemini', apiKey: ENV.GEMINI_API_KEY };
    if (def === 'openai' && ENV.OPENAI_API_KEY) return { provider: 'openai', apiKey: ENV.OPENAI_API_KEY };
    return { provider: 'ollama', model: ENV.OLLAMA_MODEL || 'qwen2.5:3b' };
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isoDay(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d);
    return date.toISOString().slice(0, 10);
}

function build30DayChart(purchases: any[]) {
    const now = new Date();
    const chartData: { date: string; purchases: number; revenue: number }[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = isoDay(d);
        const dayP = purchases.filter((p: any) => isoDay(p.createdAt) === dayStr);
        chartData.push({
            date: fmtDate(d),
            purchases: dayP.length,
            revenue: dayP.reduce((s: number, p: any) => s + (p.amount || 0), 0),
        });
    }
    return chartData;
}

// ── List & filter ─────────────────────────────────────────────────────────────

export async function listAgents(userId: string, query: { isDraft?: string; status?: string; search?: string }) {
    let workspace = await Workspace.findOne({ ownerId: userId });
    if (!workspace) {
        workspace = new Workspace({ name: 'Default Workspace', ownerId: userId, members: [userId] });
        await workspace.save();
    }

    const filter: Record<string, unknown> = { workspaceId: workspace._id };
    const { isDraft, status, search } = query;

    if (status === 'published') filter.isDraft = false;
    else if (status === 'drafts') filter.isDraft = true;
    else if (status === 'listed') filter['marketplace.published'] = true;
    else if (isDraft !== undefined) filter.isDraft = isDraft === 'true';

    if (search?.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: regex }, { description: regex }];
    }

    return AgentRepository.findMany(filter);
}

// ── Get single agent with graph ───────────────────────────────────────────────

export async function getAgentWithGraph(id: string) {
    const agent = await AgentRepository.findById(id);
    if (!agent) return null;

    const { nodes, edges } = await AgentRepository.getGraph(id);
    return {
        ...agent.toObject(),
        graph: {
            nodes: nodes.map((n: any) => ({
                id: n.nodeId, type: n.type, position: n.position,
                data: { ...n.data, chain: n.chain, tool: n.tool, params: n.params },
            })),
            edges: edges.map((e: any) => ({
                id: e.edgeId, source: e.source, target: e.target,
                sourceHandle: e.sourceHandle, targetHandle: e.targetHandle,
                label: e.label, data: e.data,
            })),
        },
    };
}

// ── Plan status ───────────────────────────────────────────────────────────────

export async function getPlanStatus(userId: string) {
    const user = await User.findById(userId).select('tokens plan planExpiry');
    if (!user) throw { code: 404, message: 'User not found' };

    const workspace = await Workspace.findOne({ ownerId: userId });
    const agentCount = workspace ? await AgentRepository.count({ workspaceId: workspace._id }) : 0;
    const plan = PLANS[(user.plan as PlanId) || 'free'];

    return {
        plan: user.plan, tokens: user.tokens, agentCount,
        agentLimit: plan.agentLimit,
        atLimit: plan.agentLimit !== -1 && agentCount >= plan.agentLimit,
        canDelete: plan.canDelete, canReEdit: plan.canReEdit,
    };
}

// ── Revenue dashboard ─────────────────────────────────────────────────────────

export async function getRevenueDashboard(userId: string) {
    const sellerOid = new mongoose.Types.ObjectId(userId);
    const workspace = await Workspace.findOne({ ownerId: sellerOid });
    if (!workspace) return { agents: [], totalViews: 0, totalPurchases: 0, totalRevenue: 0, chartData: [] };

    const [agents, purchases] = await Promise.all([
        AgentRepository.findWithSelect({ workspaceId: workspace._id }, 'name description marketplace agentType isDraft createdAt ownerId'),
        Purchase.find({ sellerId: sellerOid }).sort({ createdAt: -1 }),
    ]);

    const totalViews = agents.reduce((s: number, a: any) => s + (Number((a.marketplace as any)?.stats?.views) || 0), 0);
    const totalPurchases = purchases.length;
    const totalRevenue = purchases.reduce((s: number, p: any) => s + (p.amount || 0), 0);
    const chartData = build30DayChart(purchases);

    const agentBreakdown = agents.map((a: any) => {
        const mkt = (a.marketplace as any) || {};
        const ap = purchases.filter((p: any) => String(p.agentId) === String(a._id));
        return {
            _id: a._id, name: a.name, description: a.description, agentType: a.agentType,
            isDraft: a.isDraft, published: mkt.published || false, category: mkt.category,
            views: Number(mkt.stats?.views) || 0, purchases: ap.length,
            revenue: ap.reduce((s: number, p: any) => s + (p.amount || 0), 0),
            pricing: mkt.pricing,
        };
    });

    return { agents: agentBreakdown, totalViews, totalPurchases, totalRevenue, chartData };
}

// ── Per-agent stats ───────────────────────────────────────────────────────────

export async function getAgentStats(agentId: string) {
    const agent = await AgentRepository.findById(agentId);
    if (!agent) throw { code: 404, message: 'Agent not found' };

    const purchases = await Purchase.find({ agentId }).sort({ createdAt: -1 });
    const mkt = (agent.marketplace as any) || {};

    return {
        views: Number(mkt.stats?.views) || 0,
        purchases: purchases.length,
        revenue: purchases.reduce((s: number, p: any) => s + (p.amount || 0), 0),
        rating: Number(mkt.stats?.rating) || 0,
        chartData: build30DayChart(purchases),
    };
}

// ── Create agent ──────────────────────────────────────────────────────────────

export interface CreateAgentParams {
    userId: string;
    name: string;
    description?: string;
    persona?: string;
    graph?: any;
    identities?: any;
    character?: any;
    isDraft?: boolean;
    agentType?: string;
    chains?: string[];
    log: (msg: string) => void;
}

export async function createAgent(params: CreateAgentParams) {
    const { userId, name, description, persona, graph, identities, character,
        isDraft, agentType = 'operational_agent', chains, log } = params;

    const [workspace, user] = await Promise.all([
        Workspace.findOne({ ownerId: userId }),
        User.findById(userId).select('apiKeys').lean(),
    ]);
    if (!workspace) throw { code: 404, message: 'No workspace found' };

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

    if (chains && chains.length > 0) {
        const wallets: any[] = [];
        for (const chain of chains) {
            try { wallets.push(await WalletService.generateWallet(chain) as any); } catch { log(`wallet gen failed for ${chain}`); }
        }
        if (wallets.length > 0) agentData.blockchain = wallets;
    }

    const agent = await AgentRepository.create(agentData);
    await User.findByIdAndUpdate(userId, { $inc: { tokens: -300 } });

    const fallbackNode = {
        agentId: agent._id, nodeId: `character-${Date.now()}`, type: 'input',
        position: { x: 100, y: 100 },
        data: {
            name: finalCharacter.identity?.name || name, description: agent.description,
            role: finalCharacter.identity?.role || 'Onhandl Agent', persona,
            traits: finalCharacter.character?.traits || [], agentType,
            consoleOutput: [[`[${new Date().toLocaleTimeString()}] Agent ${name} initialized.`]],
        },
    };

    await AgentRepository.saveGraph(agent._id, graph, fallbackNode);
    return agent;
}

// ── Create from template ──────────────────────────────────────────────────────

export async function createAgentFromTemplate(userId: string, templateId: string, name: string) {
    let workspace = await Workspace.findOne({ ownerId: userId });
    if (!workspace) {
        workspace = new Workspace({ name: 'Default Workspace', ownerId: userId, members: [userId] });
        await workspace.save();
    }

    const user = await User.findById(userId).select('apiKeys').lean();
    const { provider, model } = resolveProviderKeys((user as any)?.apiKeys);

    const template = AgentTemplateService.getTemplateById(templateId);
    if (!template) throw { code: 404, message: 'Template not found' };

    const agent = await AgentRepository.create({
        ownerId: userId, workspaceId: workspace._id, name,
        description: (template as any).description, character: (template as any).character || {},
        agentType: (template as any).agentType || 'operational_agent', persona: (template as any).description,
        modelProvider: provider, modelConfig: { modelName: model || 'qwen2.5:3b' }, isDraft: true,
        graph: { nodes: (template as any).nodes, edges: (template as any).edges },
    });

    await AgentRepository.createTemplateGraph(agent._id, (template as any).nodes, (template as any).edges);
    return agent;
}

// ── Update agent ──────────────────────────────────────────────────────────────

export interface UpdateAgentParams {
    id: string;
    name?: string;
    description?: string;
    persona?: string;
    graph?: any;
    identities?: any;
    character?: any;
    isDraft?: boolean;
    provider?: string;
    apiKey?: string;
    model?: string;
    agentType?: string;
    log: (msg: string) => void;
}

export async function updateAgent(params: UpdateAgentParams) {
    const { id, name, description, persona, graph, identities, character,
        isDraft, provider, apiKey, model, agentType, log } = params;

    const agent = await AgentRepository.findById(id);
    if (!agent) throw { code: 404, message: 'Agent not found' };

    const currentAgentType = agentType || (agent.character as any)?.agent_type || 'operational_agent';

    if (name) agent.name = name;
    if (description !== undefined) agent.description = description;
    if (identities) agent.identities = identities;
    if (isDraft !== undefined) agent.isDraft = isDraft;
    if (provider) agent.modelProvider = provider as any;
    else if (!agent.modelProvider) agent.modelProvider = 'ollama';
    if (model) agent.modelConfig.modelName = model;

    let intermediateCharacter = character ? { ...agent.character, ...character } : agent.character || {};

    if (persona && persona !== agent.persona && (!(intermediateCharacter as any).character?.bio || Object.keys(intermediateCharacter).length <= 1)) {
        const enhanced = await enhancePersona(name || agent.name, persona, provider || agent.modelProvider, apiKey, model || agent.modelConfig.modelName, currentAgentType);
        if (!enhanced.character || !enhanced.identity) throw new Error('AI generated an incomplete character.');
        intermediateCharacter = enhanced;
        agent.persona = persona;
        if (!description) agent.description = enhanced.identity?.description || enhanced.character?.bio;
    }

    if (Object.keys(intermediateCharacter).length > 0) {
        const validationResult = validateCharacter(currentAgentType, intermediateCharacter);
        if (!validationResult.isValid) throw { code: 400, message: 'Character Schema Validation Failed', details: validationResult.errors };
        agent.character = intermediateCharacter;
    }

    if (agentType) agent.agentType = agentType as any;
    await AgentRepository.save(agent);
    if (graph) await AgentRepository.syncGraph(id, graph);

    return agent;
}

// ── Delete agent ──────────────────────────────────────────────────────────────

export async function deleteAgent(id: string) {
    const agent = await AgentRepository.findByIdAndDelete(id);
    if (!agent) throw { code: 404, message: 'Agent not found' };
    await AgentRepository.deleteGraph(id);
    return agent;
}

// ── Preview enhance (no save) ─────────────────────────────────────────────────

export async function previewEnhancePersona(
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
