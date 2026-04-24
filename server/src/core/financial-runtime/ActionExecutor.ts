import { eventBus } from '../../infrastructure/events/eventBus';
import { ExecutableAction, RuntimeEvent } from './types';

export class ActionExecutor {
    async execute(agentId: string, action: ExecutableAction, event: RuntimeEvent): Promise<void> {
        const createdAt = Date.now();

        eventBus.emit('FINANCIAL_ACTION.STARTED', {
            agentId,
            type: action.type,
            eventId: event.id,
            workspaceId: event.workspaceId,
            payload: action,
            createdAt,
        });

        try {
            if (action.type === 'TRANSFER_FUNDS') {
                eventBus.emit('FUNDS.TRANSFER_REQUESTED', {
                    agentId,
                    workspaceId: event.workspaceId,
                    eventId: event.id,
                    to: action.config.to,
                    amount: action.config.amount,
                    asset: action.config.asset,
                    chain: action.config.chain,
                    label: action.config.label,
                    createdAt,
                });
            }

            if (action.type === 'RETAIN_FUNDS') {
                eventBus.emit('FUNDS.RETAINED', {
                    agentId,
                    workspaceId: event.workspaceId,
                    eventId: event.id,
                    amount: action.config.amount,
                    label: action.config.label,
                    createdAt,
                });
            }

            eventBus.emit('FINANCIAL_ACTION.EXECUTED', {
                agentId,
                type: action.type,
                eventId: event.id,
                workspaceId: event.workspaceId,
                payload: action,
            });

            eventBus.emit('FINANCIAL_ACTION.COMPLETED', {
                agentId,
                type: action.type,
                eventId: event.id,
                workspaceId: event.workspaceId,
                payload: action,
                createdAt,
            });
        } catch (error: any) {
            eventBus.emit('FINANCIAL_ACTION.FAILED', {
                agentId,
                type: action.type,
                eventId: event.id,
                workspaceId: event.workspaceId,
                payload: action,
                error: error?.message || 'Action execution failed',
                createdAt,
            });

            throw error;
        }
    }
}
