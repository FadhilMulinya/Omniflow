import { IFinancialAgent } from '../../../../../infrastructure/database/models/FinancialAgent';
import { FinancialAgentRepository } from '../../../../../modules/financial-agents/financial-repositories/financial-agent.repository';
import { FinancialAgentStateRepository } from '../../../../../modules/financial-agents/financial-repositories/financial-agent-state.repository';
import { MonitorTransactionsTool } from '../../../../../infrastructure/blockchain/ckb/ckb-specific-tools/ckb_indexer_monitor_transactions';
import { eventBus } from '../../../../../infrastructure/events/eventBus';

export class CkbFundsReceivedSource {
    /**
     * One poll cycle: find all active CKB agents and scan for new incoming transactions.
     * Call this repeatedly (e.g. from a setInterval or Agenda job) to keep the event source alive.
     */
    async pollOnce(): Promise<void> {
        const agents = await FinancialAgentRepository.findActiveWithNetwork('CKB');

        for (const agent of agents) {
            try {
                await this.pollAgent(agent);
            } catch (error) {
                console.error(
                    `[CkbFundsReceivedSource] Failed to poll agent ${agent._id}:`,
                    error
                );
            }
        }
    }

    private async pollAgent(agent: IFinancialAgent): Promise<void> {
        // Find the active CKB network config
        const ckbConfig = agent.networkConfigs.find(
            (nc) => nc.network === 'CKB' && nc.enabled
        );
        if (!ckbConfig) return;

        const walletAddress = ckbConfig.wallet.address;
        if (!walletAddress) return;

        // Load agent state — skip if none exists yet
        const state = await FinancialAgentStateRepository.findByAgentId(String(agent._id));
        if (!state) {
            console.warn(
                `[CkbFundsReceivedSource] No state found for agent ${agent._id}. Skipping.`
            );
            return;
        }

        // Read persisted cursor (undefined on first run — tool will use current chain tip)
        const existingMeta = (state.metadata ?? {}) as Record<string, any>;
        const existingWatchers = (existingMeta.watchers ?? {}) as Record<string, any>;
        const existingCkbWatcher = (existingWatchers.ckb ?? {}) as Record<string, any>;
        const fromBlock: string | undefined = existingCkbWatcher.nextFromBlock;

        // One poll cycle via the existing MonitorTransactionsTool
        const result = await MonitorTransactionsTool.execute({
            address: walletAddress,
            fromBlock,
            limit: 50,
        });

        // Emit FUNDS.RECEIVED for every new incoming transaction
        for (const tx of result.transactions) {
            eventBus.emit('FUNDS.RECEIVED', {
                workspaceId: String(agent.workspaceId),
                agentId: String(agent._id),
                amount: tx.amountCkb,
                asset: 'CKB',
                chain: 'CKB',
                recipientAddress: tx.toAddress,
                payerAddress: tx.fromAddress || undefined,
                txHash: tx.txHash,
            });
        }

        // Persist the new cursor so we don't re-scan the same block range on restart
        state.metadata = {
            ...existingMeta,
            watchers: {
                ...existingWatchers,
                ckb: {
                    ...existingCkbWatcher,
                    nextFromBlock: result.nextFromBlock,
                    lastScannedAt: new Date().toISOString(),
                },
            },
        };

        await FinancialAgentStateRepository.save(state);

        if (result.newTransactionCount > 0) {
            console.log(
                `[CkbFundsReceivedSource] Agent ${agent._id}: emitted ${result.newTransactionCount} FUNDS.RECEIVED event(s). Next cursor: ${result.nextFromBlock}`
            );
        }
    }
}
