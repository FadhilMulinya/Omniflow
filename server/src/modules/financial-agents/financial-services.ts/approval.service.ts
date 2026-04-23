import mongoose from 'mongoose';
import { eventBus } from '../../../infrastructure/events/eventBus';
import { ApprovalRequestRepository } from '../financial-repositories/approval.repository';

export const ApprovalService = {
    async approve(requestId: string) {
        const request = await ApprovalRequestRepository.updateStatus(requestId, 'approved');
        if (!request) return null;

        eventBus.emit('APPROVAL.GRANTED', {
            approvalRequestId: String(request._id),
            agentId: String(request.agentId),
            workspaceId: '',
            action: request.action,
            resolvedAt: request.resolvedAt?.getTime() || Date.now(),
        });

        return request;
    },

    async reject(requestId: string) {
        const request = await ApprovalRequestRepository.updateStatus(requestId, 'rejected');
        if (!request) return null;

        eventBus.emit('APPROVAL.REJECTED', {
            approvalRequestId: String(request._id),
            agentId: String(request.agentId),
            workspaceId: '',
            action: request.action,
            resolvedAt: request.resolvedAt?.getTime() || Date.now(),
        });

        return request;
    },

    async listPending(agentId: string) {
        if (!mongoose.Types.ObjectId.isValid(agentId)) return [];
        return ApprovalRequestRepository.findPendingByAgent(agentId);
    },
};
