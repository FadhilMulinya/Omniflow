import { BlockchainTool } from "../../types";
import { ccc, cccClient } from "./ckb_wallet_tool";
import { MonitorTransactionsInput, MonitorTransactionsSchema } from "./ckb_contracts_tool";

/**
 * Tool: blockchain.ckb.indexer.monitor_transactions
 *
 * Polls for new incoming transactions to a CKB address starting from a given
 * block (or the current chain tip if none is given).
 *
 * Each call is one poll cycle — pass the returned `nextFromBlock` value as
 * `fromBlock` on the next call to receive only the transactions that arrived
 * since the previous poll.
 */
export const MonitorTransactionsTool: BlockchainTool<MonitorTransactionsInput, any> = {
    name: "blockchain.ckb.indexer.monitor_transactions",
    description:
        "Polls the CKB indexer for new incoming transactions to a wallet address. Pass the address and an optional fromBlock (hex) to start scanning. Returns new incoming transactions and the nextFromBlock to use for the next poll cycle.",
    schema: MonitorTransactionsSchema,
    uiSchema: {
        address: { type: "string", label: "CKB Address", placeholder: "ckt1q..." },
        fromBlock: { type: "string", label: "From Block (hex)", placeholder: "0x0" },
        limit: { type: "number", label: "Limit per poll", placeholder: "50" },
    },
    async execute(input) {
        const { script: lockScript } = await ccc.Address.fromString(input.address, cccClient);

        // Resolve the starting block — use fromBlock if given, otherwise the current tip
        let fromBlockNum: bigint;
        if (input.fromBlock) {
            fromBlockNum = BigInt(input.fromBlock);
        } else {
            const tip = await cccClient.getTip();
            fromBlockNum = BigInt(tip);
        }

        // Resolve the current chain tip
        const currentTip = await cccClient.getTip();
        const toBlockNum = BigInt(currentTip);

        const newTransactions: any[] = [];

        if (toBlockNum > fromBlockNum) {
            for await (const txRecord of cccClient.findTransactions(
                {
                    script: lockScript,
                    scriptType: "lock",
                    scriptSearchMode: "exact",
                    filter: {
                        blockRange: [fromBlockNum, toBlockNum],
                    },
                },
                false,
                "asc",
                input.limit ?? 50
            )) {
                // Only capture outputs — these are funds arriving at the address
                if (txRecord.ioType !== "output") continue;

                try {
                    const txResponse = await cccClient.getTransaction(txRecord.txHash);
                    if (!txResponse) continue;

                    const tx = txResponse.transaction;
                    const output = tx.outputs[Number(txRecord.ioIndex)];
                    if (!output) continue;

                    const amount = ccc.numFrom(output.capacity);

                    // Attempt to resolve sender from the first input
                    let fromAddress: string | undefined;
                    if (tx.inputs.length > 0) {
                        try {
                            const prevTx = await cccClient.getTransaction(
                                tx.inputs[0].previousOutput.txHash
                            );
                            if (prevTx) {
                                const senderOutput =
                                    prevTx.transaction.outputs[
                                    Number(tx.inputs[0].previousOutput.index)
                                    ];
                                if (senderOutput) {
                                    fromAddress = ccc.Address.fromScript(
                                        senderOutput.lock,
                                        cccClient
                                    ).toString();
                                }
                            }
                        } catch {
                            // sender unknown — continue without it
                        }
                    }

                    newTransactions.push({
                        txHash: txRecord.txHash,
                        blockNumber: txRecord.blockNumber?.toString() ?? null,
                        amountCkb: ccc.fixedPointToString(amount),
                        fromAddress: fromAddress ?? null,
                        toAddress: input.address,
                        status: txResponse.status,
                    });
                } catch {
                    // skip unresolvable tx
                }
            }
        }

        // Return the next fromBlock so the caller can continue polling
        const nextFromBlock = "0x" + toBlockNum.toString(16);

        return {
            address: input.address,
            scannedRange: {
                from: "0x" + fromBlockNum.toString(16),
                to: nextFromBlock,
            },
            newTransactionCount: newTransactions.length,
            transactions: newTransactions,
            nextFromBlock,
        };
    },
};
