import { OnhandlSDK } from '../../src/sdk';

async function main() {
    const apiKey = process.env.ONHANDL_API_KEY || 'your_api_key_here';
    const sdk = new OnhandlSDK({ apiKey });

    const AGENT_ID = 'your_agent_id_here';

    try {
        console.log(`Starting execution for agent: ${AGENT_ID}...`);
        const execution = await sdk.startExecution({
            agentId: AGENT_ID,
            initialState: { some_input: 'hello world' }
        });

        console.log(`Execution created: ${execution.id}`);

        console.log(`Triggering run for execution: ${execution.id}...`);
        const runResult = await sdk.runExecution({ executionId: execution.id });
        console.log('Run result:', runResult.message);

        // Polling (Simplified for example)
        console.log('Fetching execution details...');
        const details = await sdk.getExecution({ executionId: execution.id });
        console.log('Status:', details.status);

    } catch (error) {
        console.error('Execution workflow failed:', error);
    }
}

main();
