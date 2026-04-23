import { PolicyAction, RuntimeEvent } from './types';

export class ActionPlanner {
    plan(event: RuntimeEvent, actions: PolicyAction[]): PolicyAction[] {
        return actions.map((action) => {
            if (action.type !== 'SPLIT_FUNDS') return action;

            const amount = this.toNumber(event.payload.amount);
            if (amount === null) return action;

            const reserve = ((amount * action.config.reservePct) / 100).toFixed(8);
            const invest = ((amount * action.config.investPct) / 100).toFixed(8);
            const liquid = ((amount * action.config.liquidPct) / 100).toFixed(8);

            return {
                type: 'SPLIT_FUNDS',
                config: {
                    ...action.config,
                    reservePct: Number(reserve),
                    investPct: Number(invest),
                    liquidPct: Number(liquid),
                },
            };
        });
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
