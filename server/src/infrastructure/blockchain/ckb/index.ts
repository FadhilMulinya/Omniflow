import { BlockchainTool } from "../types";

import {
    getBalanceTools,
    transferTools,
    walletTools,
    ckbContractsTools,
    txBuilderTools,
    rpcTools,
    indexerTools,
} from "./ckb_specific_tools";

import {
    nodeAdminTools,
    channelTools,
    invoiceTools,
} from "./ckb_fiber_tools";

// Re-export everything for a unified API
export * from "./ckb_specific_tools";
export * from "./ckb_fiber_tools";


export const ckbSpecificTools: BlockchainTool<any, any>[] = [
    ...rpcTools,
    ...indexerTools,
    ...txBuilderTools,
    ...getBalanceTools,
    ...transferTools,
    ...walletTools,
    ...ckbContractsTools
];

export const ckbFiberTools: BlockchainTool<any, any>[] = [
    ...nodeAdminTools,
    ...channelTools,
    ...invoiceTools,
];

export const allCkbEcosystemTools = [
    ...ckbSpecificTools,
    ...ckbFiberTools
];
