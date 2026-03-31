/**
 * Token System — FlawLess Platform
 *
 * Tokens are the internal currency for AI operations.
 * Each LLM call consumes tokens based on provider, model, and operation type.
 */

// ── Plan Definitions ──────────────────────────────────────────────────────────

export type PlanId = 'free' | 'starter' | 'pro' | 'unlimited';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface Plan {
    id: PlanId;
    name: string;
    monthlyPrice: number;       // USD base price (monthly)
    agentLimit: number;         // max agents (-1 = unlimited)
    canDelete: boolean;
    canReEdit: boolean;
    tokenRefillMonthly: number; // tokens granted each month
    features: string[];
}

export const PLANS: Record<PlanId, Plan> = {
    free: {
        id: 'free',
        name: 'Free',
        monthlyPrice: 0,
        agentLimit: 3,
        canDelete: false,
        canReEdit: false,
        tokenRefillMonthly: 500,
        features: [
            'Up to 3 agents',
            '500 tokens / month',
            'Community support',
            'Basic templates',
        ],
    },
    starter: {
        id: 'starter',
        name: 'Starter',
        monthlyPrice: 8,
        agentLimit: 10,
        canDelete: true,
        canReEdit: true,
        tokenRefillMonthly: 5_000,
        features: [
            'Up to 10 agents',
            '5,000 tokens / month',
            'Email support',
            'All templates',
            'Marketplace publishing',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 16,
        agentLimit: 100,
        canDelete: true,
        canReEdit: true,
        tokenRefillMonthly: 25_000,
        features: [
            'Up to 100 agents',
            '25,000 tokens / month',
            'Priority support',
            'Custom personas',
            'Analytics dashboard',
            'Embed & PWA export',
        ],
    },
    unlimited: {
        id: 'unlimited',
        name: 'Unlimited',
        monthlyPrice: 30,
        agentLimit: -1,
        canDelete: true,
        canReEdit: true,
        tokenRefillMonthly: 100_000,
        features: [
            'Unlimited agents',
            '100,000 tokens / month',
            'Dedicated support',
            'White-label embeds',
            'Revenue dashboard',
            'Custom billing',
        ],
    },
};

// ── Billing Discounts ─────────────────────────────────────────────────────────

export const BILLING_DISCOUNTS: Record<BillingCycle, number> = {
    monthly: 0,
    quarterly: 0.10, // 10% off
    yearly: 0.25,    // 25% off
};

/**
 * Calculate final price for a plan + billing cycle.
 * Returns the total amount charged at the start of each period.
 */
export function calculatePrice(planId: PlanId, cycle: BillingCycle): {
    unitPrice: number;   // price per month after discount
    totalCharged: number; // amount charged per billing period
    discount: number;    // fraction (0.10 = 10%)
    months: number;
} {
    const plan = PLANS[planId];
    const discount = BILLING_DISCOUNTS[cycle];
    const months = cycle === 'monthly' ? 1 : cycle === 'quarterly' ? 3 : 12;
    const unitPrice = plan.monthlyPrice * (1 - discount);
    const totalCharged = Math.round(unitPrice * months * 100) / 100;
    return { unitPrice, totalCharged, discount, months };
}

// ── Token Costs ───────────────────────────────────────────────────────────────

/** How many platform tokens one LLM token costs (approximate). */
export const TOKEN_COSTS: Record<string, number> = {
    // Character generation (one-off, expensive)
    enhance_persona: 50,
    // Per agent query
    agent_query: 5,
    // Embed/PWA chat
    embed_chat: 3,
    // Marketplace listing
    publish_agent: 10,
    // Export PWA download
    export_pwa: 5,
};

/** New-user welcome bonus */
export const WELCOME_TOKENS = 1_000;

/**
 * Deduct tokens from a user balance.
 * Returns false if the user doesn't have enough tokens.
 */
export function canAfford(currentTokens: number, operation: keyof typeof TOKEN_COSTS): boolean {
    return currentTokens >= (TOKEN_COSTS[operation] ?? 0);
}
