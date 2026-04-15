import { OnhandlSDK, OnhandlSDKError } from '../../src/sdk';

async function main() {
    // 1. Invalid API Key Demo
    const sdk = new OnhandlSDK({ apiKey: 'invalid_key' });

    try {
        console.log('Attempting request with invalid key...');
        await sdk.listExecutions();
    } catch (error) {
        if (error instanceof OnhandlSDKError) {
            console.log(`Caught expected error: ${error.message} (Status: ${error.statusCode})`);
            console.log('Details:', error.payload);
        } else {
            console.error('Unexpected error:', error);
        }
    }

    // 2. Resource Not Found Demo
    const validSdk = new OnhandlSDK({ apiKey: process.env.ONHANDL_API_KEY || 'your_valid_key' });
    try {
        console.log('\nAttempting to get non-existent execution...');
        await validSdk.getExecution({ executionId: 'non_existent_id' });
    } catch (error) {
        if (error instanceof OnhandlSDKError) {
            console.log(`Caught 404: ${error.message}`);
        }
    }
}

main();
