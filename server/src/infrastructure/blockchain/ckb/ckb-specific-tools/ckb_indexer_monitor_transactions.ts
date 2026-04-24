import { BlockchainTool } from "../../types";
import { ccc, cccClient } from "./ckb_wallet_tool";
import { MonitorTransactionsInput, MonitorTransactionsSchema } from "./ckb_contracts_tool";

/**
 * Tool: blockchain.ckb.indexer.monitor_transactions
 *
 * Returns the most recent output transactions for the given CKB address.
 * No block-range filtering — duplicate protection is handled upstream by
 * DB-level idempotency (IdempotencyService) in CkbFundsReceivedSource.
 *
 * Mirrors the proven CCC Playground approach:
 *   findTransactionsByLock(script, undefined, false, "desc", limit)
 */
export const MonitorTransactionsTool: BlockchainTool<MonitorTransactionsInput, any> = {
    name: "blockchain.ckb.indexer.monitor_transactions",
    description:
        "Polls the CKB indexer for recent incoming transactions to a wallet address. Returns new incoming transactions and the nextFromBlock to use for the next poll cycle.",
    schema: MonitorTransactionsSchema,
    uiSchema: {
        address: { type: "string", label: "CKB Address", placeholder: "ckt1q..." },
        fromBlock: { type: "string", label: "From Block (hex)", placeholder: "0x0" },
        limit: { type: "number", label: "Limit per poll", placeholder: "50" },
    },
    async execute(input) {
        const { script } = await ccc.Address.fromString(input.address, cccClient);

        const currentBlock = BigInt(await cccClient.getTip());
        const fromBlock = input.fromBlock ? BigInt(input.fromBlock) : currentBlock;

        const newTransactions: any[] = [];

        // Per-poll dedup guard (txHash + ioIndex) — cross-poll dedup is done by IdempotencyService
        const seen = new Set<string>();

        for await (const tx of cccClient.findTransactionsByLock(
            script,
            undefined,
            false,
            "desc",
            input.limit ?? 50
        )) {
            if (tx.ioType !== "output") continue;

            const key = `${tx.txHash}:${tx.ioIndex}`;
            if (seen.has(key)) continue;
            seen.add(key);

            try {
                const txData = await cccClient.getTransaction(tx.txHash);
                if (!txData) continue;

                // Use the exact output at ioIndex — not the sum of all outputs
                const output = txData.transaction.outputs[Number(tx.ioIndex)];
                if (!output) continue;

                const amountShannons = BigInt(output.capacity);

                newTransactions.push({
                    txHash: tx.txHash,
                    ioIndex: tx.ioIndex?.toString(),
                    blockNumber: tx.blockNumber?.toString() ?? null,
                    amountCkb: (Number(amountShannons) / 1e8).toFixed(8),
                    amountShannons: amountShannons.toString(),
                    toAddress: input.address,
                    status: txData.status,
                });
            } catch {
                continue;
            }
        }

        const nextFromBlock = "0x" + currentBlock.toString(16);

        return {
            address: input.address,
            scannedRange: {
                from: "0x" + fromBlock.toString(16),
                to: nextFromBlock,
            },
            newTransactionCount: newTransactions.length,
            transactions: newTransactions,
            nextFromBlock,
        };
    },
};
