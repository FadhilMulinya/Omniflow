import { PolicyAction, PermissionConfig } from './types';

export class PermissionEngine {
    check(action: PolicyAction, permissions: PermissionConfig): { allowed: boolean; reason?: string } {
        if (permissions.allowedActions && !permissions.allowedActions.includes(action.type)) {
            return { allowed: false, reason: `Action ${action.type} is not allowed` };
        }

        if (action.type === 'TRANSFER_FUNDS' || action.type === 'INVEST_FUNDS') {
            if (permissions.allowedAssets && !permissions.allowedAssets.includes(action.config.asset)) {
                return { allowed: false, reason: `Asset ${action.config.asset} is not allowed` };
            }

            if (permissions.allowedChains && !permissions.allowedChains.includes(action.config.chain)) {
                return { allowed: false, reason: `Chain ${action.config.chain} is not allowed` };
            }

            if (action.type === 'TRANSFER_FUNDS' && permissions.allowedRecipients && !permissions.allowedRecipients.includes(action.config.to)) {
                return { allowed: false, reason: 'Recipient is not allowlisted' };
            }

            if (permissions.maxSpendPerTx) {
                const amount = this.toNumber(action.config.amount);
                const maxPerTx = this.toNumber(permissions.maxSpendPerTx);
                if (amount === null || maxPerTx === null) return { allowed: false, reason: 'Invalid spend limit configuration' };
                if (amount > maxPerTx) return { allowed: false, reason: 'Amount exceeds maxSpendPerTx' };
            }
        }

        return { allowed: true };
    }

    private toNumber(value: unknown): number | null {
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        if (typeof value === 'string' && value.trim() !== '') {
            const n = Number(value);
            if (Number.isFinite(n)) return n;
        }
        return null;
    }
}
