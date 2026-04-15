import { AgentDefinition } from '../../infrastructure/database/models/AgentDefinition';
import { AgentNode } from '../../infrastructure/database/models/AgentNode';
import { AgentEdge } from '../../infrastructure/database/models/AgentEdge';
import { ENV } from '../../shared/config/environments';
import { Orchestrator } from '../../core/engine/orchestrator';
import { Readable } from 'stream';

// ── Embed ─────────────────────────────────────────────────────────────────────

export async function enableEmbed(id: string, allowedDomains: string[], allowedIPs: string[], theme: string) {
    const agent = await AgentDefinition.findById(id);
    if (!agent) throw { code: 404, message: 'Agent not found' };

    const existing = agent.exportSettings || ({} as any);
    agent.exportSettings = {
        embedEnabled: true,
        allowedDomains,
        allowedIPs,
        theme,
        pwaDownloadCount: existing.pwaDownloadCount || 0,
        lastExportedAt: new Date(),
        mcpEnabled: existing.mcpEnabled || false,
    };
    await agent.save();

    const embedUrl = `${ENV.APP_URL}/embed/agent/${id}`;
    return {
        embedUrl,
        iframeSnippet: `<iframe\n  src="${embedUrl}"\n  width="400"\n  height="600"\n  frameborder="0"\n  allow="clipboard-write"\n></iframe>`,
        scriptSnippet: `<script src="${embedUrl}/widget.js" defer></script>`,
    };
}

// ── PWA ───────────────────────────────────────────────────────────────────────

export async function exportPwa(id: string) {
    const agent = await AgentDefinition.findById(id);
    if (!agent) throw { code: 404, message: 'Agent not found' };

    const [nodes, edges] = await Promise.all([
        AgentNode.find({ agentId: id }),
        AgentEdge.find({ agentId: id }),
    ]);

    const existing = agent.exportSettings || ({} as any);
    agent.exportSettings = {
        embedEnabled: existing.embedEnabled || false,
        allowedDomains: existing.allowedDomains || [],
        allowedIPs: existing.allowedIPs || [],
        theme: existing.theme || 'dark',
        pwaDownloadCount: (existing.pwaDownloadCount || 0) + 1,
        lastExportedAt: new Date(),
        mcpEnabled: existing.mcpEnabled || false,
    };
    await agent.save();

    return {
        agentConfig: {
            id: agent._id, name: agent.name, description: agent.description,
            agentType: agent.agentType, character: agent.character,
            modelProvider: agent.modelProvider, modelConfig: agent.modelConfig,
            graph: {
                nodes: nodes.map((n) => ({ id: n.nodeId, type: n.type, position: n.position, data: { ...n.data, chain: n.chain, tool: n.tool, params: n.params } })),
                edges: edges.map((e) => ({ id: e.edgeId, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })),
            },
            apiUrl: ENV.API_URL,
            exportedAt: new Date().toISOString(),
        },
        agentName: agent.name,
    };
}

// ── MCP ───────────────────────────────────────────────────────────────────────

export async function enableMcp(id: string) {
    const agent = await AgentDefinition.findById(id);
    if (!agent) throw { code: 404, message: 'Agent not found' };

    const existing = agent.exportSettings || ({} as any);
    agent.exportSettings = { ...existing, mcpEnabled: true, lastExportedAt: new Date() };
    await agent.save();

    const serverBase = ENV.API_URL.replace(/\/api$/, '');
    return { mcpEndpoint: `${serverBase}/mcp/agent/${id}`, agentId: id, agentName: agent.name };
}

// ── Public embed metadata ─────────────────────────────────────────────────────

export async function getEmbedMeta(id: string) {
    const agent = await AgentDefinition.findById(id).catch(() => null);
    if (!agent) throw { code: 404, message: 'Agent not found' };
    if (!agent.exportSettings?.embedEnabled) throw { code: 403, message: 'Embed not enabled for this agent' };

    return {
        id: agent._id, name: agent.name, description: agent.description, agentType: agent.agentType,
        character: { bio: (agent.character as any)?.bio, personality: (agent.character as any)?.personality, name: (agent.character as any)?.name },
        theme: agent.exportSettings.theme || 'dark',
        apiUrl: ENV.API_URL,
    };
}

// ── Embed chat ────────────────────────────────────────────────────────────────

export interface EmbedChatAccess {
    allowed: boolean;
    reason?: string;
}

export function checkEmbedAccess(agent: any, clientIP: string, origin: string): EmbedChatAccess {
    const { allowedIPs = [], allowedDomains = [] } = agent.exportSettings;
    if (allowedIPs.length === 0 && allowedDomains.length === 0) return { allowed: true };

    const ipOk = allowedIPs.length === 0 || allowedIPs.some((ip: string) => clientIP.startsWith(ip));
    const domainOk = allowedDomains.length === 0 || allowedDomains.some((d: string) => origin.includes(d));
    if (!ipOk && !domainOk) return { allowed: false, reason: 'This agent is not authorized for your IP address' };
    return { allowed: true };
}

export async function streamEmbedChat(id: string, prompt: string, sessionId: string): Promise<Readable> {
    const readable = new Readable({ read() { } });
    Orchestrator.handleQuery(prompt, id, 'embed_user', sessionId, readable)
        .then(() => readable.push(null))
        .catch((err: any) => {
            readable.push(`data: ${JSON.stringify({ error: err.message })}\n\n`);
            readable.push(null);
        });
    return readable;
}
