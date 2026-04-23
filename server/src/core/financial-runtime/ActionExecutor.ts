import { eventBus } from '../../infrastructure/events/eventBus';
import { ExecutableAction, RuntimeEvent } from './types';

export class ActionExecutor {
    async execute(agentId: string, action: ExecutableAction, event: RuntimeEvent): Promise<void> {
        eventBus.emit('FINANCIAL_ACTION.EXECUTED', {
            agentId,
            type: action.type,
            eventId: event.id,
            workspaceId: event.workspaceId,
            payload: action,
        });
    }
}
