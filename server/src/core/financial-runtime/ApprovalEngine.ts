import mongoose from 'mongoose';
import { ApprovalConfig, PolicyAction } from './types';
import { ApprovalRequestRepository } from '../../modules/financial-agents/financial-repositories/approval.repository';

export class ApprovalEngine {
    async requiresApproval(
        agentId: string,
        action: PolicyAction,
        approval: ApprovalConfig,
        knownRecipients: string[] = []
    ): Promise<{ required: boolean; requestId?: string }> {
        if (action.type === 'REQUEST_APPROVAL') {
            const request = await ApprovalRequestRepository.create({
                agentId: new mongoose.Types.ObjectId(agentId),
                action,
                reason: action.config.reason,
                status: 'pending',
            });
            return { required: true, requestId: String(request._id) };
        }

        if (action.type === 'INVEST_FUNDS' && approval.requireApprovalForInvestments) {
            const request = await ApprovalRequestRepository.create({
                agentId: new mongoose.Types.ObjectId(agentId),
                action,
                reason: 'Investment action requires approval',
                status: 'pending',
            });
            return { required: true, requestId: String(request._id) };
        }

        if (action.type === 'TRANSFER_FUNDS') {
            if (approval.requireApprovalForNewRecipients && !knownRecipients.includes(action.config.to)) {
                const request = await ApprovalRequestRepository.create({
                    agentId: new mongoose.Types.ObjectId(agentId),
                    action,
                    reason: 'Transfer to a new recipient requires approval',
                    status: 'pending',
                });
                return { required: true, requestId: String(request._id) };
            }

            if (approval.requireApprovalAbove) {
                const amount = this.toNumber(action.config.amount);
                const threshold = this.toNumber(approval.requireApprovalAbove);
                if (amount !== null && threshold !== null && amount > threshold) {
                    const request = await ApprovalRequestRepository.create({
                        agentId: new mongoose.Types.ObjectId(agentId),
                        action,
                        reason: 'Transfer amount exceeds approval threshold',
                        status: 'pending',
                    });
                    return { required: true, requestId: String(request._id) };
                }
            }
        }

        return { required: false };
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
