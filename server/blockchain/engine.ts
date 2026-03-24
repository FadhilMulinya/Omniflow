import { ethers } from 'ethers';

export class BlockchainEngine {
    provider: ethers.JsonRpcProvider;

    constructor(rpcUrl: string) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
    }

    async estimateGas(txRequest: ethers.TransactionRequest): Promise<bigint> {
        try {
            return await this.provider.estimateGas(txRequest);
        } catch (err) {
            console.error('Gas estimation failed:', err);
            throw err;
        }
    }

    async sendTransaction(wallet: ethers.Wallet, txRequest: ethers.TransactionRequest) {
        const connectedWallet = wallet.connect(this.provider);
        const tx = await connectedWallet.sendTransaction(txRequest);
        return tx.wait();
    }
}
