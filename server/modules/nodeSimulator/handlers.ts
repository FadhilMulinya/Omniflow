import { FastifyRequest, FastifyReply } from 'fastify';
import { AgentDefinition } from '../../models/AgentDefinition';
import { simulateInputNode } from '../../engine/simulators/input-node-simulator';
import { simulateProcessingNode } from '../../engine/simulators/processing-node-simulator';
import { simulateActionNode } from '../../engine/simulators/action-node-simulator';
import { simulateConditionNode } from '../../engine/simulators/condition-node-simulator';
import { simulateOutputNode } from '../../engine/simulators/output-node-simulator';
import { simulateTelegramSendMessage } from '../../engine/simulators/telegram-node-simulator';
import { simulateWhatsAppSendMessage } from '../../engine/simulators/whatsapp-node-simulator';
import { simulateCryptoWallet } from '../../engine/simulators/crypto/wallet-simulator';
import { simulateCryptoTrade } from '../../engine/simulators/crypto/trade-simulator';
import { simulateBlockchainNode } from '../../engine/simulators/blockchain-node-simulator';
import { simulateA2ANode } from '../../engine/simulators/a2a-node-simulator';
import { nodeError } from '../../engine/types/base';
import { timestamp } from '../../engine/simulators/base';

interface SimulateNodeBody {
  nodeType: string;
  nodeData: Record<string, unknown>;
  inputValues?: Record<string, unknown>;
  agentId?: string;
}

export async function handleSimulateNode(req: FastifyRequest, reply: FastifyReply) {
  const { nodeType, nodeData, inputValues = {}, agentId } = req.body as SimulateNodeBody;

  if (!nodeType) {
    return reply.status(400).send({ error: 'nodeType is required' });
  }

  const consoleOutput: string[] = [
    `${timestamp()} 🧪 Isolated node simulation: ${(nodeData as any)?.name ?? nodeType}`,
    `${timestamp()} 📥 Input values: ${JSON.stringify(inputValues).substring(0, 300)}`,
  ];

  let agent: unknown = null;
  if (agentId) {
    agent = await AgentDefinition.findById(agentId).lean();
  }

  try {
    let output;

    switch (nodeType) {
      case 'input':
        output = simulateInputNode(nodeData, inputValues);
        break;
      case 'processing':
        output = await simulateProcessingNode(nodeData, inputValues, consoleOutput, agent);
        break;
      case 'action':
        output = await simulateActionNode(nodeData, inputValues);
        break;
      case 'condition':
        output = simulateConditionNode(nodeData, inputValues);
        break;
      case 'output':
        output = simulateOutputNode(nodeData, inputValues);
        break;
      case 'telegram':
        output = await simulateTelegramSendMessage(nodeData, inputValues, consoleOutput);
        break;
      case 'whatsapp':
        output = await simulateWhatsAppSendMessage(nodeData, inputValues, consoleOutput);
        break;
      case 'crypto_wallet':
        output = await simulateCryptoWallet(nodeData, inputValues, agent);
        break;
      case 'crypto_trade':
        output = simulateCryptoTrade(nodeData, inputValues);
        break;
      case 'blockchain_tool':
        output = await simulateBlockchainNode(nodeData, inputValues, consoleOutput);
        break;
      case 'agent_call':
        output = await simulateA2ANode(nodeData, inputValues, consoleOutput, agent);
        break;
      default:
        output = nodeError(`No simulator registered for node type: "${nodeType}"`);
    }

    consoleOutput.push(
      output.status === 'success'
        ? `${timestamp()} ✅ Simulation complete — confidence: ${(output.confidence * 100).toFixed(0)}%`
        : `${timestamp()} ❌ Simulation failed: ${output.message}`
    );

    return reply.send({ output, consoleOutput });
  } catch (err: any) {
    consoleOutput.push(`${timestamp()} ❌ Simulator threw: ${err.message}`);
    return reply.send({
      output: nodeError(err.message),
      consoleOutput,
    });
  }
}
