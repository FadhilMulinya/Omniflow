import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CkbFundsReceivedSource } from '../../../core/financial-runtime/EventSources/blockchain/ckb/CkbFundsReceivedSource';
import { FinancialAgentRepository } from '../../../modules/financial-agents/financial-repositories/financial-agent.repository';
import { FinancialAgentStateRepository } from '../../../modules/financial-agents/financial-repositories/financial-agent-state.repository';
import { MonitorTransactionsTool } from '../../../infrastructure/blockchain/ckb/ckb-specific-tools/ckb_indexer_monitor_transactions';
import { eventBus } from '../../../infrastructure/events/eventBus';

describe('CkbFundsReceivedSource', () => {
    beforeEach(() => {
        vi.spyOn(eventBus, 'emit').mockImplementation(() => true);
        vi.spyOn(FinancialAgentStateRepository, 'save').mockResolvedValue(true as any);
        // Turn off console output inside test bounds
        vi.spyOn(console, 'warn').mockImplementation(() => { });
        vi.spyOn(console, 'log').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('emits FUNDS.RECEIVED for new transactions and updates the block cursor', async () => {
        const source = new CkbFundsReceivedSource();

        // 1. Mock repository to return one active CKB agent
        const mockAgent = {
            _id: 'agent_1',
            workspaceId: 'workspace_1',
            networkConfigs: [
                {
                    network: 'CKB',
                    enabled: true,
                    wallet: { address: 'ckb1qqmockaddress' }
                }
            ]
        } as any;

        vi.spyOn(FinancialAgentRepository, 'findActiveWithNetwork').mockResolvedValue([mockAgent]);

        // 2. Mock state repository to return an agent state with an existing cursor
        const mockState = {
            agentId: 'agent_1',
            metadata: {
                watchers: {
                    ckb: {
                        nextFromBlock: '0x1000'
                    }
                }
            }
        } as any;
        vi.spyOn(FinancialAgentStateRepository, 'findByAgentId').mockResolvedValue(mockState);

        // 3. Mock MonitorTransactionsTool to return 1 transaction
        vi.spyOn(MonitorTransactionsTool, 'execute').mockResolvedValue({
            address: 'ckb1qqmockaddress',
            scannedRange: { from: '0x1000', to: '0x100a' },
            newTransactionCount: 1,
            transactions: [
                {
                    txHash: '0xtesttxhash',
                    blockNumber: '0x100a',
                    timestamp: new Date(),
                    amountCkb: '100.5',
                    toAddress: 'ckb1qqmockaddress'
                }
            ],
            nextFromBlock: '0x100b'
        } as any);

        // Run the poll loop
        await source.pollOnce();

        // Verify emit was called correctly
        expect(eventBus.emit).toHaveBeenCalledWith('FUNDS.RECEIVED', expect.objectContaining({
            agentId: 'agent_1',
            workspaceId: 'workspace_1',
            amount: '100.5',
            asset: 'CKB',
            chain: 'CKB',
            recipientAddress: 'ckb1qqmockaddress',
            txHash: '0xtesttxhash'
        }));

        // Verify state was saved with the new cursor
        expect(FinancialAgentStateRepository.save).toHaveBeenCalled();
        expect(mockState.metadata.watchers.ckb.nextFromBlock).toBe('0x100b');
    });

    it('skips agent if no CKB config is enabled', async () => {
        const source = new CkbFundsReceivedSource();

        const mockAgent = {
            _id: 'agent_no_ckb',
            networkConfigs: []
        } as any;

        vi.spyOn(FinancialAgentRepository, 'findActiveWithNetwork').mockResolvedValue([mockAgent]);

        const executeSpy = vi.spyOn(MonitorTransactionsTool, 'execute');

        await source.pollOnce();

        expect(executeSpy).not.toHaveBeenCalled();
    });

    it('gracefully handles and logs errors for a single agent without stopping the loop', async () => {
        const source = new CkbFundsReceivedSource();

        // 1. Mock repository to return two active CKB agents
        const mockAgent1 = {
            _id: 'agent_1_fails',
            workspaceId: 'workspace_1',
            networkConfigs: [{ network: 'CKB', enabled: true, wallet: { address: 'ckbFAIL' } }]
        } as any;
        const mockAgent2 = {
            _id: 'agent_2_succeeds',
            workspaceId: 'workspace_1',
            networkConfigs: [{ network: 'CKB', enabled: true, wallet: { address: 'ckbSUCCEED' } }]
        } as any;

        vi.spyOn(FinancialAgentRepository, 'findActiveWithNetwork').mockResolvedValue([mockAgent1, mockAgent2]);

        const mockState1 = { metadata: {} } as any;
        const mockState2 = { metadata: {} } as any;

        vi.spyOn(FinancialAgentStateRepository, 'findByAgentId')
            .mockResolvedValueOnce(mockState1)
            .mockResolvedValueOnce(mockState2);

        const executeSpy = vi.spyOn(MonitorTransactionsTool, 'execute')
            .mockRejectedValueOnce(new Error('simulated network failure'))
            .mockResolvedValueOnce({
                address: 'ckbSUCCEED',
                scannedRange: { from: '0x0', to: '0x1' },
                newTransactionCount: 0,
                transactions: [],
                nextFromBlock: '0x2'
            } as any);

        await source.pollOnce();

        expect(executeSpy).toHaveBeenCalledTimes(2);
        // Error should be logged but loop continued
        expect(console.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to poll agent agent_1_fails'),
            expect.any(Error)
        );
    });
});
