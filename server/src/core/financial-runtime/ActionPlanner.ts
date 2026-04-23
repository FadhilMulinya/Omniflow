import { ExecutableAction, PolicyAction, RuntimeEvent } from './types';

export class ActionPlanner {
    plan(event: RuntimeEvent, actions: PolicyAction[]): ExecutableAction[] {
        const baseAmount = this.toNumber((event.payload as { amount?: unknown }).amount);

        return actions.flatMap((action): ExecutableAction[] => {
            if (action.type === 'TRANSFER_FUNDS') {
                return [{
                    type: 'TRANSFER_FUNDS',
                    config: { ...action.config },
                }];
            }

            if (action.type === 'SWAP_FUNDS') {
                return [{
                    type: 'SWAP_FUNDS',
                    config: { ...action.config },
                }];
            }

            if (action.type === 'INVEST_FUNDS') {
                return [{
                    type: 'INVEST_FUNDS',
                    config: { ...action.config },
                }];
            }

            if (action.type === 'ALLOCATE_FUNDS') {
                if (baseAmount === null) return [];
                return action.config.allocations.flatMap((allocation): ExecutableAction[] => {
                    const amount = this.percentAmount(baseAmount, allocation.percentage);

                    if (allocation.kind === 'transfer') {
                        const asset = allocation.asset ?? (event.payload as { asset?: string }).asset;
                        const chain = allocation.chain ?? (event.payload as { chain?: string }).chain;
                        if (!asset || !chain) return [];

                        return [{
                            type: 'TRANSFER_FUNDS',
                            config: {
                                to: allocation.to,
                                amount,
                                asset,
                                chain,
                                label: allocation.label,
                            },
                        }];
                    }

                    const fromAsset = allocation.fromAsset ?? (event.payload as { asset?: string }).asset;
                    const chain = allocation.chain ?? (event.payload as { chain?: string }).chain;
                    if (!fromAsset || !chain) return [];

                    return [{
                        type: 'SWAP_FUNDS',
                        config: {
                            amount,
                            fromAsset,
                            toAsset: allocation.toAsset,
                            chain,
                            strategy: allocation.strategy,
                            label: allocation.label,
                        },
                    }];
                });
            }

            if (baseAmount === null) return [];

            const asset = action.config.asset ?? (event.payload as { asset?: string }).asset;
            const chain = action.config.chain ?? (event.payload as { chain?: string }).chain;
            if (!asset || !chain) return [];

            return [
                {
                    type: 'TRANSFER_FUNDS',
                    config: {
                        bucket: 'reserve',
                        amount: this.percentAmount(baseAmount, action.config.reservePct),
                        asset,
                        chain,
                    },
                },
                {
                    type: 'INVEST_FUNDS',
                    config: {
                        bucket: 'invest',
                        strategy: 'default',
                        amount: this.percentAmount(baseAmount, action.config.investPct),
                        asset,
                        chain,
                    },
                },
                {
                    type: 'TRANSFER_FUNDS',
                    config: {
                        bucket: 'liquid',
                        amount: this.percentAmount(baseAmount, action.config.liquidPct),
                        asset,
                        chain,
                    },
                },
            ];
        });
    }

    private percentAmount(baseAmount: number, percent: number): string {
        return ((baseAmount * percent) / 100).toFixed(8);
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
