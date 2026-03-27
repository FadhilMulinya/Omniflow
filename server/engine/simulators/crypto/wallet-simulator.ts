import { generateRandomAddress, generateRandomBalance, getCurrencyForNetwork } from './helpers';

export async function simulateCryptoWallet(data: any, inputValues: Record<string, any>, agent?: any) {
    const outputs: Record<string, any> = {};

    const connectionType = inputValues['connectionType'] || data.inputs?.find((input: any) => input.key === 'connectionType')?.value || 'Wallet Address';
    const network = inputValues['network'] || data.inputs?.find((input: any) => input.key === 'network')?.value || 'ckb-testnet';
    const storageType = inputValues['storageType'] || data.inputs?.find((input: any) => input.key === 'storageType')?.value || 'temporary';

    const walletType = inputValues['walletType'] || data.walletType || 'System';
    const isManagedOrPermanent = walletType === 'System' || storageType === 'permanent';

    if (isManagedOrPermanent && agent?.blockchain) {
        const existing = agent.blockchain.find((b: any) => b.network === network);
        if (existing?.walletAddress) {
            const walletInfo = {
                address: existing.walletAddress,
                network,
                currency: getCurrencyForNetwork(network),
                connectionType: existing.walletType === 'managed' ? 'System' : 'MetaMask',
                lastUpdated: new Date().toISOString(),
                connected: true,
            };
            outputs['connected'] = true;
            outputs['walletInfo'] = walletInfo;
            outputs['balance'] = generateRandomBalance(network);
            outputs['outputData'] = { ...data.inputs, ...walletInfo };
            return { ...outputs, ...data.inputs };
        }
    }

    const privateKey = inputValues['privateKey'] || data.inputs?.find((input: any) => input.key === 'privateKey')?.value || '';
    const walletAddress = inputValues['walletAddress'] || data.inputs?.find((input: any) => input.key === 'walletAddress')?.value || '';

    const canConnect = connectionType === 'Private Key' ? !!privateKey : (connectionType === 'System' || !!walletAddress);

    if (canConnect) {
        const address = walletAddress || generateRandomAddress(network);
        const balance = generateRandomBalance(network);
        const currency = getCurrencyForNetwork(network);

        const walletInfo = {
            address,
            network,
            currency,
            connectionType,
            lastUpdated: new Date().toISOString(),
            connected: true,
        };

        // If permanent, save to agent record
        if (storageType === 'permanent' && agent) {
            if (!agent.blockchain) agent.blockchain = [];
            const existingIdx = agent.blockchain.findIndex((b: any) => b.network === network);

            const walletRecord = {
                network,
                walletAddress: address,
                walletType: connectionType === 'System' ? 'managed' : 'externally_owned',
                privateKey: privateKey || undefined
            };

            if (existingIdx >= 0) {
                agent.blockchain[existingIdx] = walletRecord;
            } else {
                agent.blockchain.push(walletRecord);
            }

            await agent.save();
        }

        outputs['connected'] = true;
        outputs['walletInfo'] = walletInfo;
        outputs['balance'] = balance;
        outputs['outputData'] = { ...data.inputs, ...walletInfo };
    } else {
        outputs['connected'] = false;
        outputs['walletInfo'] = null;
        outputs['balance'] = 0;
        outputs['outputData'] = { ...data.inputs };
    }

    return { ...outputs, ...data.inputs };
}

