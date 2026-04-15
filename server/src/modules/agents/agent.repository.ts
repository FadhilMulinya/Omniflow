import mongoose from 'mongoose';
import { AgentDefinition } from '../../infrastructure/database/models/AgentDefinition';
import { AgentNode } from '../../infrastructure/database/models/AgentNode';
import { AgentEdge } from '../../infrastructure/database/models/AgentEdge';

// ── Types ────────────────────────────────────────────────────────────────────

export interface AgentFilter {
    workspaceId: mongoose.Types.ObjectId | string;
    isDraft?: boolean;
    'marketplace.published'?: boolean;
    '$or'?: Array<Record<string, unknown>>;
}

export interface NodeDoc {
    agentId: unknown;
    nodeId: string;
    type: string;
    position: unknown;
    chain?: string;
    tool?: string;
    params?: unknown;
    data?: unknown;
}

export interface EdgeDoc {
    agentId: unknown;
    edgeId: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
    data?: unknown;
}

// ── Agent CRUD ───────────────────────────────────────────────────────────────

export const AgentRepository = {
    async findById(id: string) {
        return AgentDefinition.findById(id);
    },

    async findMany(filter: Record<string, unknown>) {
        return AgentDefinition.find(filter).sort({ updatedAt: -1 });
    },

    async findWithSelect(filter: Record<string, unknown>, select: string) {
        return AgentDefinition.find(filter).select(select);
    },

    async count(filter: Record<string, unknown>) {
        return AgentDefinition.countDocuments(filter);
    },

    async create(data: Record<string, unknown>) {
        const agent = new AgentDefinition(data);
        await agent.save();
        return agent;
    },

    async save(agent: any) {
        return agent.save();
    },

    async findByIdAndDelete(id: string) {
        return AgentDefinition.findByIdAndDelete(id);
    },

    async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) {
        return AgentDefinition.updateOne(filter, update);
    },

    // ── Graph ──────────────────────────────────────────────────────────────────

    async getGraph(agentId: string) {
        const [nodes, edges] = await Promise.all([
            AgentNode.find({ agentId }),
            AgentEdge.find({ agentId }),
        ]);
        return { nodes, edges };
    },

    async saveGraph(agentId: unknown, graph: any, fallbackNode?: NodeDoc) {
        if (graph?.nodes && graph.nodes.length > 0) {
            await AgentNode.insertMany(
                graph.nodes.map((n: any) => ({
                    agentId,
                    nodeId: n.id,
                    type: n.type,
                    position: n.position,
                    chain: n.data?.chain,
                    tool: n.data?.tool,
                    params: n.data?.params,
                    data: n.data,
                }))
            );
        } else if (fallbackNode) {
            await AgentNode.create(fallbackNode);
        }

        if (graph?.edges) {
            await AgentEdge.insertMany(
                graph.edges.map((e: any) => ({
                    agentId,
                    edgeId: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle,
                    targetHandle: e.targetHandle,
                    label: e.label,
                    data: e.data,
                }))
            );
        }
    },

    async syncGraph(agentId: string, graph: any) {
        if (graph.nodes) {
            await AgentNode.deleteMany({ agentId });
            await AgentNode.insertMany(
                graph.nodes.map((n: any) => ({
                    agentId,
                    nodeId: n.id,
                    type: n.type,
                    position: n.position,
                    chain: n.data?.chain,
                    tool: n.data?.tool,
                    params: n.data?.params,
                    data: n.data,
                }))
            );
        }
        if (graph.edges) {
            await AgentEdge.deleteMany({ agentId });
            await AgentEdge.insertMany(
                graph.edges.map((e: any) => ({
                    agentId,
                    edgeId: e.id,
                    source: e.source,
                    target: e.target,
                    sourceHandle: e.sourceHandle,
                    targetHandle: e.targetHandle,
                    label: e.label,
                    data: e.data,
                }))
            );
        }
    },

    async deleteGraph(agentId: string) {
        await Promise.all([
            AgentNode.deleteMany({ agentId }),
            AgentEdge.deleteMany({ agentId }),
        ]);
    },

    async createTemplateGraph(agentId: unknown, nodes: any[], edges: any[]) {
        for (const node of nodes) {
            await AgentNode.create({
                nodeId: node.id, agentId, type: node.type,
                position: node.position, data: node.data,
            });
        }
        for (const edge of edges) {
            await AgentEdge.create({
                edgeId: edge.id, agentId, source: edge.source,
                target: edge.target, sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
            });
        }
    },
};
