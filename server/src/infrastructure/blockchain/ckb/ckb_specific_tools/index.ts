import { GetBalanceTool } from "./ckb_get_balance";
import { TransferTool } from "./ckb_transfer";
import { BuildTransferTxTool } from "./ckb_tx_builder";
import { GetTipHeaderTool } from "./ckb_rpc_tip_header";
import { GetTransactionTool } from "./ckb_rpc_transaction";
import { GetBlockTool } from "./ckb_rpc_block";
import { GetLiveCellsByLockTool } from "./ckb_indexer_live_cells";
import { GetCapacityByLockTool } from "./ckb_indexer_capacity";

export * from "./ckb_get_balance";
export * from "./ckb_transfer";
export * from "./ckb_tx_builder";
export * from "./ckb_rpc_tip_header";
export * from "./ckb_rpc_transaction";
export * from "./ckb_rpc_block";
export * from "./ckb_indexer_live_cells";
export * from "./ckb_indexer_capacity";

export const getBalanceTools = [GetBalanceTool];
export const transferTools = [TransferTool];
export const txBuilderTools = [BuildTransferTxTool];
export const rpcTools = [
    GetTipHeaderTool,
    GetTransactionTool,
    GetBlockTool
];
export const indexerTools = [
    GetLiveCellsByLockTool,
    GetCapacityByLockTool
];

// Reserved for upcoming wallet-specific tools
export const walletTools = [];

// Reserved for upcoming contract interaction tools
export const ckbContractsTools = [];