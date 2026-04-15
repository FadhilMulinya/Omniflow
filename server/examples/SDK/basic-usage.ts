import { OnhandlSDK } from '../../src/sdk';

async function main() {
    const apiKey = process.env.ONHANDL_API_KEY || 'your_api_key_here';

    // Initialize the SDK
    const sdk = new OnhandlSDK({
        apiKey,
        baseUrl: 'http://localhost:3001'
    });

    try {
        console.log('Listing all executions...');
        const executions = await sdk.listExecutions();
        console.log(`Found ${executions.length} executions.`);

        if (executions.length > 0) {
            console.log('Last execution:', executions[0]);
        }
    } catch (error) {
        console.error('Failed to list executions:', error);
    }
}

main();
