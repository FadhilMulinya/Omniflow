import { ExecutionRun, ExecutionStatus } from '../models/ExecutionRun';
import { AgentDefinition } from '../models/AgentDefinition';
import { eventBus } from '../lib/eventBus';
import { agenda } from '../workers/agenda';

export class AgentRunner {
    async runAgent(executionId: string) {
        const execution = await ExecutionRun.findById(executionId);
        if (!execution) throw new Error('Execution not found');

        const agent = await AgentDefinition.findById(execution.agentDefinitionId);
        if (!agent) throw new Error('Agent not found');

        // Mark as running
        execution.status = 'running';
        execution.startedAt = new Date();
        await execution.save();

        console.log(`Starting to run agent: ${agent.name} (Execution: ${executionId})`);

        // Process nodes (dummy linear execution for now)
        for (const node of agent.graph.nodes) {
            console.log(`Processing node: ${node.id}`);

            if (node.type === 'llm') {
                await agenda.now('execute-llm-call', { executionId, nodeId: node.id, prompt: node.data.prompt });
            } else if (node.type === 'blockchain_tx') {
                await agenda.now('submit-blockchain-tx', { executionId, txData: node.data });
            }
        }

        // In a real state machine, we'd wait for workers before marking complete.
        // For now we'll just demonstrate the event firing.
        eventBus.emit('agent.node.completed', { executionId });
    }
}

// Hook up the runner to the event bus
const runner = new AgentRunner();
eventBus.on('agent.run.started', async (data) => {
    await runner.runAgent(data.executionId);
});
