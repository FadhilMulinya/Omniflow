import { FastifyPluginAsync } from 'fastify';
import { AgentDefinition } from '../models/AgentDefinition';
import { Workspace } from '../models/Workspace';
import { Purchase } from '../models/Purchase';

export const MARKETPLACE_CATEGORIES = [
    'Trading Bot',
    'Analytics',
    'DeFi Assistant',
    'Portfolio Manager',
    'Data Feed',
    'Custom',
] as const;

export const MARKETPLACE_NETWORKS = ['Ethereum', 'CKB', 'Solana', 'Polygon', 'All'] as const;

export const marketplaceRoutes: FastifyPluginAsync = async (fastify) => {
    // ── List published agents ─────────────────────────────────────────────────
    fastify.get<{
        Querystring: {
            category?: string;
            pricing?: 'free' | 'paid' | 'all';
            network?: string;
            search?: string;
            page?: string;
            limit?: string;
        };
    }>('/marketplace', async (request) => {
        const { category, pricing = 'all', network, search, page = '1', limit = '20' } = request.query;

        const filter: any = {
            'marketplace.published': true,
            'marketplace.visibility': 'public',
        };

        if (category && category !== 'All') filter['marketplace.category'] = category;
        if (pricing !== 'all') filter['marketplace.pricing.type'] = pricing;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        if (network && network !== 'All') {
            filter['blockchain.network'] = { $regex: network, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [agents, total] = await Promise.all([
            AgentDefinition.find(filter)
                .select('name description agentType marketplace blockchain ownerId createdAt updatedAt')
                .sort({ 'marketplace.stats.views': -1, updatedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            AgentDefinition.countDocuments(filter),
        ]);

        return { agents, total, page: parseInt(page), limit: parseInt(limit) };
    });

    // ── Get single marketplace agent ──────────────────────────────────────────
    fastify.get<{ Params: { id: string } }>('/marketplace/:id', async (request, reply) => {
        const { id } = request.params;
        const agent = await AgentDefinition.findOneAndUpdate(
            { _id: id, 'marketplace.published': true },
            { $inc: { 'marketplace.stats.views': 1 } },
            { new: true }
        ).select('-blockchain.privateKey -blockchain.publicKey');

        if (!agent) return reply.code(404).send({ error: 'Agent not found in marketplace' });
        return agent;
    });

    // ── Publish / update marketplace listing ──────────────────────────────────
    fastify.post<{
        Params: { id: string };
        Body: {
            published?: boolean;
            category?: string;
            visibility?: 'public' | 'unlisted';
            pricing?: { type: 'free' | 'paid'; price?: number; currency?: string };
            paymentMethods?: {
                stripe?: { enabled: boolean };
                crypto?: {
                    enabled: boolean;
                    walletAddress?: string;
                    network?: string;
                    asset?: string;
                    amount?: number;
                };
            };
        };
    }>('/marketplace/:id/publish', async (request, reply) => {
        const token = request.cookies['auth_token'];
        if (!token) return reply.code(401).send({ error: 'Unauthorized' });

        let decoded: any;
        try { decoded = fastify.jwt.verify(token); } catch { return reply.code(401).send({ error: 'Invalid token' }); }

        const { id } = request.params;
        const { published = true, category = 'Custom', visibility = 'public', pricing, paymentMethods } = request.body;

        // Input validation
        if (category && !(MARKETPLACE_CATEGORIES as readonly string[]).includes(category) && category !== 'Custom') {
            return reply.code(400).send({ error: `Invalid category. Must be one of: ${MARKETPLACE_CATEGORIES.join(', ')}` });
        }
        if (pricing?.type === 'paid' && (!pricing.price || pricing.price <= 0)) {
            return reply.code(400).send({ error: 'Paid agents require a price greater than 0' });
        }

        const agent = await AgentDefinition.findById(id);
        if (!agent) return reply.code(404).send({ error: 'Agent not found' });

        // Verify ownership
        const workspace = await Workspace.findOne({ _id: agent.workspaceId, ownerId: decoded.id });
        if (!workspace) return reply.code(403).send({ error: 'Not authorized' });

        // Agents must be published (not draft) before listing on marketplace
        if (published && agent.isDraft) {
            return reply.code(400).send({ error: 'Publish the agent before listing it on the marketplace' });
        }

        const existing = (agent.marketplace as any) || {};
        const existingStats = existing.stats || {};

        agent.marketplace = {
            published,
            category,
            visibility,
            pricing: pricing || existing.pricing || { type: 'free', price: 0, currency: 'USD' },
            paymentMethods: {
                stripe: {
                    enabled: paymentMethods?.stripe?.enabled ?? existing.paymentMethods?.stripe?.enabled ?? false,
                    stripeAccountId: existing.paymentMethods?.stripe?.stripeAccountId || '',
                },
                crypto: {
                    enabled: paymentMethods?.crypto?.enabled ?? existing.paymentMethods?.crypto?.enabled ?? false,
                    walletAddress: paymentMethods?.crypto?.walletAddress || existing.paymentMethods?.crypto?.walletAddress || '',
                    network: paymentMethods?.crypto?.network || existing.paymentMethods?.crypto?.network || '',
                    asset: paymentMethods?.crypto?.asset || existing.paymentMethods?.crypto?.asset || '',
                    amount: paymentMethods?.crypto?.amount ?? existing.paymentMethods?.crypto?.amount ?? 0,
                },
            },
            stats: {
                views: Number(existingStats.views) || 0,
                purchases: Number(existingStats.purchases) || 0,
                rating: Number(existingStats.rating) || 0,
            },
        };

        agent.markModified('marketplace');

        try {
            await agent.save();
        } catch (err: any) {
            console.error('[Marketplace Publish] Save error:', err);
            return reply.code(500).send({ error: 'Failed to save marketplace listing', details: err.message });
        }

        return { message: published ? 'Agent published to marketplace' : 'Agent removed from marketplace', agent };
    });

    // ── Purchase history for buyer ────────────────────────────────────────────
    fastify.get('/marketplace/purchases/mine', async (request, reply) => {
        const token = request.cookies['auth_token'];
        if (!token) return reply.code(401).send({ error: 'Unauthorized' });
        let decoded: any;
        try { decoded = fastify.jwt.verify(token); } catch { return reply.code(401).send({ error: 'Invalid token' }); }

        const purchases = await Purchase.find({ buyerId: decoded.id })
            .populate('agentId', 'name description marketplace')
            .sort({ createdAt: -1 });

        return purchases;
    });
};
