import Stripe from 'stripe';
import { AgentDefinition } from '../../infrastructure/database/models/AgentDefinition';
import { Purchase } from '../../infrastructure/database/models/Purchase';
import { User } from '../../infrastructure/database/models/User';

export const PaymentRepository = {
    async findAgentById(id: string) {
        return AgentDefinition.findById(id);
    },
    async findUserById(id: string) {
        return User.findById(id).select('stripeAccountId');
    },
    async updateStripeAccountId(userId: string, stripeAccountId: string) {
        return User.findByIdAndUpdate(userId, { stripeAccountId });
    },
    async createPurchase(data: Record<string, unknown>) {
        return Purchase.create(data);
    },
    async confirmPurchaseBySession(sessionId: string) {
        return Purchase.findOneAndUpdate({ stripeSessionId: sessionId }, { status: 'confirmed' });
    },
    async findPurchaseById(id: string) {
        return Purchase.findById(id);
    },
    async incrementAgentPurchaseCount(agentId: string) {
        return AgentDefinition.findByIdAndUpdate(agentId, {
            $inc: { 'marketplace.stats.purchases': 1 },
        });
    },
};
