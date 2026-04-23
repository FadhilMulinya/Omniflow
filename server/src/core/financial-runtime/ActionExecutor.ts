import mongoose from 'mongoose';
import { eventBus } from '../../infrastructure/events/eventBus';
import { ApprovalRequestRepository } from '../../modules/financial-agents/financial-repositories/approval.repository';
import { PolicyAction, RuntimeEvent } from './types';

export class ActionExecutor {
    async execute(agentId: string, action: PolicyAction, event: RuntimeEvent): Promise<void> {
        if (action.type === 'REQUEST_APPROVAL') {
            await ApprovalRequestRepository.create({
                agentId: new mongoose.Types.ObjectId(agentId),
                action,
                reason: action.config.reason,
                status: 'pending',
            });
            return;
        }

        eventBus.emit('FINANCIAL_ACTION.EXECUTED', {
            agentId,
            type: action.type,
            eventId: event.id,
            workspaceId: event.workspaceId,
            payload: action,
        });
    }
}
