// Simulate output node
export function simulateOutputNode(data: any, inputValues: Record<string, any>) {
    const outputs: Record<string, any> = {};

    // For each output defined in the node (usually just 'done' or similar)
    data.outputs?.forEach((output: any) => {
        outputs[output.key] = true;
    });

    // Build a readable response from upstream data
    const result = inputValues['result'];
    let response = '';

    if (typeof result === 'object' && result !== null) {
        if (result.ckb !== undefined) {
            response = `Balance check complete. Address ${result.address?.substring(0, 8)}... has ${result.ckb} CKB.`;
        } else if (result.txHash) {
            response = `Transfer successful! Transaction hash https://testnet.explorer.nervos.org/transaction/${result.txHash}`;
        } else if (result.error) {
            response = `Execution failed: ${result.error}`;
        } else if (result.intent && result.message) {
            // General AI response
            response = result.message;
        } else {
            response = JSON.stringify(result, null, 2);
        }
    } else {
        response = String(result || inputValues['value'] || inputValues['message'] || 'Workflow execution completed.');
    }

    outputs['response'] = response;
    // UI expects 'displayText' for the Text Output node
    outputs['displayText'] = response;

    // Store the final processed data for full inspection
    outputs['finalData'] = inputValues;

    return outputs;
}
