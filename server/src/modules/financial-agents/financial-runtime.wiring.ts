import { randomUUID } from 'crypto';
import { eventBus } from '../../infrastructure/events/eventBus';
import { AgentRuntime } from '../../core/financial-runtime/AgentRuntime';
import { EventRouter } from '../../core/financial-runtime/EventRouter';
import { RuntimeEvent } from '../../core/financial-runtime/types';

let wired = false;

export function createFinancialRuntimeWiring() {
    if (wired) return;

    const runtime = new AgentRuntime();
    const router = new EventRouter(runtime);

    eventBus.on('PAYMENT_LINK.PAID', async (payload: Record<string, unknown>) => {
        const paymentLinkEvent: RuntimeEvent = {
            id: randomUUID(),
            type: 'PAYMENT_LINK.PAID',
            workspaceId: String(payload.workspaceId || ''),
            source: 'payment-link-verification',
            payload,
            createdAt: Date.now(),
        };

        const fundsReceivedEvent: RuntimeEvent = {
            id: randomUUID(),
            type: 'FUNDS.RECEIVED',
            workspaceId: String(payload.workspaceId || ''),
            source: 'payment-link-verification',
            payload: {
                amount: payload.amount,
                asset: payload.asset,
                chain: payload.chain,
                recipientAddress: payload.recipientAddress,
                payerAddress: payload.payerAddress,
                txHash: payload.txHash,
                paymentLinkId: payload.paymentLinkId,
            },
            createdAt: Date.now(),
        };

        try {
            await router.route(paymentLinkEvent);
            await router.route(fundsReceivedEvent);
        } catch {
            // swallow runtime errors to avoid crashing event bus listeners
        }
    });

    eventBus.on('APPROVAL.GRANTED', async (payload: Record<string, unknown>) => {
        const event: RuntimeEvent = {
            id: randomUUID(),
            type: 'APPROVAL.GRANTED',
            workspaceId: String(payload.workspaceId || ''),
            agentId: payload.agentId ? String(payload.agentId) : undefined,
            source: 'approval-service',
            payload,
            createdAt: Date.now(),
        };
        try { await router.route(event); } catch { }
    });

    eventBus.on('APPROVAL.REJECTED', async (payload: Record<string, unknown>) => {
        const event: RuntimeEvent = {
            id: randomUUID(),
            type: 'APPROVAL.REJECTED',
            workspaceId: String(payload.workspaceId || ''),
            agentId: payload.agentId ? String(payload.agentId) : undefined,
            source: 'approval-service',
            payload,
            createdAt: Date.now(),
        };
        try { await router.route(event); } catch { }
    });

    wired = true;
}
