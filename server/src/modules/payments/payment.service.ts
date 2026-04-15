import Stripe from 'stripe';
import { PaymentRepository } from './payment.repository';
import { ENV } from '../../shared/config/environments';

function getStripe(): Stripe {
    if (!ENV.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not configured');
    return new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: '2026-03-25.dahlia' });
}

export const CRYPTO_NETWORKS: Record<string, string[]> = {
    Base: ['ETH', 'USDT', 'USDC'],
    CKB: ['CKB'],
    Stellar: ['XLM', 'USDC'],
};

export const PaymentService = {
    getStripeConnectUrl(userId: string) {
        if (!ENV.STRIPE_CLIENT_ID) throw Object.assign(new Error('Stripe Connect is not configured on this server'), { code: 503 });
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: ENV.STRIPE_CLIENT_ID,
            scope: 'read_write',
            redirect_uri: ENV.STRIPE_REDIRECT_URI,
            state: userId,
        });
        return { url: `https://connect.stripe.com/oauth/authorize?${params}` };
    },

    async handleStripeCallback(code: string, userId: string) {
        const stripe = getStripe();
        const response = await stripe.oauth.token({ grant_type: 'authorization_code', code });
        const stripeAccountId = response.stripe_user_id!;
        await PaymentRepository.updateStripeAccountId(userId, stripeAccountId);
        return stripeAccountId;
    },

    async getStripeStatus(userId: string) {
        const record = await PaymentRepository.findUserById(userId);
        return { connected: !!(record as any)?.stripeAccountId, stripeAccountId: (record as any)?.stripeAccountId || null };
    },

    async createStripeCheckoutSession(buyerId: string, agentId: string) {
        const agent = await PaymentRepository.findAgentById(agentId);
        if (!agent) throw Object.assign(new Error('Agent not found'), { code: 404 });
        if (!(agent as any).marketplace?.published) throw Object.assign(new Error('Agent not on marketplace'), { code: 400 });
        if ((agent as any).marketplace.pricing.type !== 'paid') throw Object.assign(new Error('Agent is free'), { code: 400 });

        const seller = await PaymentRepository.findUserById(String((agent as any).ownerId));
        if (!(seller as any)?.stripeAccountId) throw Object.assign(new Error('Seller has not connected a Stripe account'), { code: 400 });

        const stripe = getStripe();
        const amountCents = Math.round((agent as any).marketplace.pricing.price * 100);
        const session = await stripe.checkout.sessions.create(
            {
                mode: 'payment',
                line_items: [{ price_data: { currency: (agent as any).marketplace.pricing.currency.toLowerCase(), product_data: { name: (agent as any).name, description: (agent as any).description }, unit_amount: amountCents }, quantity: 1 }],
                success_url: `${ENV.APP_URL}/marketplace/agent/${agentId}?purchase=success`,
                cancel_url: `${ENV.APP_URL}/marketplace/agent/${agentId}?purchase=cancelled`,
                metadata: { agentId, buyerId },
            },
            { stripeAccount: (seller as any).stripeAccountId }
        );
        await PaymentRepository.createPurchase({ agentId, buyerId, sellerId: (agent as any).ownerId, paymentMethod: 'stripe', amount: (agent as any).marketplace.pricing.price, currency: (agent as any).marketplace.pricing.currency, status: 'pending', stripeSessionId: session.id });
        return { sessionUrl: session.url };
    },

    async handleStripeWebhook(rawBody: string | Buffer, sig: string) {
        if (!ENV.STRIPE_WEBHOOK_SECRET) throw Object.assign(new Error('Webhook not configured'), { code: 400 });
        const stripe = getStripe();
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(rawBody, sig, ENV.STRIPE_WEBHOOK_SECRET);
        } catch {
            throw Object.assign(new Error('Invalid webhook signature'), { code: 400 });
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            await PaymentRepository.confirmPurchaseBySession(session.id);
            if (session.metadata?.agentId) {
                await PaymentRepository.incrementAgentPurchaseCount(session.metadata.agentId);
            }
        }
        return { received: true };
    },

    async initiateCryptoPurchase(buyerId: string, agentId: string, txHash: string, network: string) {
        const agent = await PaymentRepository.findAgentById(agentId);
        if (!agent) throw Object.assign(new Error('Agent not found'), { code: 404 });
        if (!(agent as any).marketplace?.paymentMethods?.crypto?.enabled) {
            throw Object.assign(new Error('Crypto payments not enabled for this agent'), { code: 400 });
        }
        const purchase = await PaymentRepository.createPurchase({ agentId, buyerId, sellerId: (agent as any).ownerId, paymentMethod: 'crypto', amount: (agent as any).marketplace.paymentMethods.crypto.amount, currency: (agent as any).marketplace.paymentMethods.crypto.asset, status: 'pending', cryptoTxHash: txHash, network });
        return { purchase, message: 'Transaction submitted — pending on-chain verification' };
    },

    async verifyCryptoPurchase(purchaseId: string) {
        const purchase = await PaymentRepository.findPurchaseById(purchaseId);
        if (!purchase) throw Object.assign(new Error('Purchase not found'), { code: 404 });
        if (!(purchase as any).cryptoTxHash) throw Object.assign(new Error('No transaction hash on record'), { code: 400 });
        return { status: (purchase as any).status, txHash: (purchase as any).cryptoTxHash, network: (purchase as any).network, message: 'On-chain verification via Blockscout MCP — integrate to confirm automatically' };
    },
};
