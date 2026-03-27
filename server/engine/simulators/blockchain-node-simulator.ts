import { allBlockchainTools } from '../../packages/tooling/blockchain/src/index';
import { executeTool } from '../../packages/tooling/blockchain/src/index';

export async function simulateBlockchainNode(data: any, inputValues: Record<string, any>, consoleOutput: string[]) {
    const outputs: Record<string, any> = {};

    try {
        const toolName = data.tool || inputValues['tool'] || data.inputs?.find((input: any) => input.key === 'tool_lookup')?.value;

        if (!toolName) {
            throw new Error(`No tool selected for blockchain node. Please select a tool in node settings.`);
        }

        const tool = allBlockchainTools.find(t => t.name === toolName);

        if (!tool) {
            throw new Error(`Blockchain tool not found: ${toolName}. This node may be disconnected from the provider chain.`);
        }

        consoleOutput.push(`[Blockchain Tool] Executing tool: ${toolName}`);

        // Construct payload from inputValues (prioritized) and data.inputs
        const parsedPayload: Record<string, any> = { ...data.params };

        // Add variables from UI inputs if present
        data.inputs?.forEach((inp: any) => {
            if (inp.value && !parsedPayload[inp.key]) {
                parsedPayload[inp.key] = inp.value;
            }
        });

        // Add variables extracted upstream (e.g. from Text Processor AI)
        for (const [k, v] of Object.entries(inputValues)) {
            if (!['tool', 'tool_lookup', 'payload', 'walletData', 'walletInfo', 'outputData'].includes(k)) {
                parsedPayload[k] = v;
            }
        }

        // Forward wallet connection data intelligently
        const wallet = inputValues['walletData'] || inputValues['walletInfo'] || inputValues;
        if (wallet && wallet.address) {
            if (!parsedPayload['from']) parsedPayload['from'] = wallet.address;
            if (!parsedPayload['address']) parsedPayload['address'] = wallet.address;
        }

        // Validation for wallet existence at runtime
        if (tool.name.includes('.get CKB balance') && !parsedPayload['address']) {
            throw new Error(`Wallet address not found. Please connect a Crypto Wallet node upstream or provide an address.`);
        }
        if (tool.name.includes('.transfer ckb') && (!parsedPayload['from'] || !parsedPayload['privateKey'])) {
            throw new Error(`Sender wallet or private key missing. Please connect a Crypto Wallet node upstream.`);
        }


        consoleOutput.push(`[Blockchain Tool] Constructed payload: ${JSON.stringify(parsedPayload)}`);

        consoleOutput.push(`[Blockchain Tool] Executing tool: ${toolName}`);
        const result = await tool.execute(parsedPayload);

        if (tool.name.includes('.get CKB balance')) {
            consoleOutput.push(`[Blockchain Tool] Balance retrieved: ${result.ckb} CKB (${result.shannons} shannons)`);
        } else if (tool.name.includes('.transfer ckb')) {
            consoleOutput.push(`[Blockchain Tool] Transfer successful. TxHash: ${result.hash}`);
        }

        consoleOutput.push(`[Blockchain Tool] Execution successful.`);
        outputs['result'] = result;
        outputs['status'] = 'success';

    } catch (error: any) {
        let displayError = error.message;
        if (error.message.includes("validation failed")) {
            displayError = `Missing required parameters. Ensure a wallet is connected and parameters are extracted correctly.`;
        }
        consoleOutput.push(`[Blockchain Tool] Error: ${displayError}`);
        outputs['result'] = { error: displayError };
        outputs['status'] = 'error';
    }

    return outputs;
}
