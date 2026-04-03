import { A2AMessage } from '../../models/A2AMessage';
import { AgentCard } from '../../models/AgentCard';
import { nodeSuccess, nodeError, NodeOutput } from '../types/base';
import { A2ANodeInputSchema, A2ANodeResult } from '../types/node-contracts';
import { timestamp } from './base';

/**
 * A2A Agent Call simulator.
 *
 * Sends a structured A2A message from the executing agent to a registered
 * recipient agent. Uses the AgentCard registry to verify the recipient exists
 * and is active before persisting the message.
 *
 * The senderAgentId is taken from the executing agent's definition.
 */
export async function simulateA2ANode(
  data: unknown,
  inputValues: Record<string, unknown>,
  consoleOutput: string[],
  agent?: unknown
): Promise<NodeOutput<A2ANodeResult>> {
  const t0 = Date.now();
  const d = data as any;
  const ag = agent as any;

  const rawInput = {
    recipientAgentId:
      (inputValues['recipientAgentId'] as string) ??
      d?.inputs?.find((i: any) => i.key === 'recipientAgentId')?.value,
    performative:
      (inputValues['performative'] as string) ??
      d?.inputs?.find((i: any) => i.key === 'performative')?.value ??
      'request',
    content:
      (inputValues['content'] as string) ??
      (inputValues['message'] as string) ??
      d?.inputs?.find((i: any) => i.key === 'content')?.value ??
      '',
    conversationId:
      (inputValues['conversationId'] as string) ??
      d?.inputs?.find((i: any) => i.key === 'conversationId')?.value,
  };

  const validated = A2ANodeInputSchema.safeParse(rawInput);
  if (!validated.success) {
    const msg = `A2A node input invalid: ${validated.error.message}`;
    consoleOutput.push(`${timestamp()} ❌ ${msg}`);
    return nodeError(msg);
  }

  const { recipientAgentId, performative, content, conversationId } = validated.data;

  consoleOutput.push(`${timestamp()} 🤝 A2A: sending "${performative}" to agent ${recipientAgentId}`);

  // Verify recipient agent is registered and active
  const recipientCard = await AgentCard.findOne({
    agentId: recipientAgentId,
    status: 'active',
  }).lean();

  if (!recipientCard) {
    const msg = `Recipient agent ${recipientAgentId} is not registered or is not active in the registry.`;
    consoleOutput.push(`${timestamp()} ❌ ${msg}`);
    return nodeError(msg, {}, { executionMs: Date.now() - t0 });
  }

  const senderAgentId: string = ag?._id?.toString() ?? 'unknown';

  try {
    const message = await A2AMessage.create({
      senderId: senderAgentId,
      receiverId: recipientAgentId,
      performative,
      content,
      conversationId: conversationId ?? crypto.randomUUID(),
      status: 'delivered',
    });

    consoleOutput.push(`${timestamp()} ✅ A2A message delivered. ID: ${message._id}`);

    return nodeSuccess<A2ANodeResult>(
      {
        messageId: message._id.toString(),
        recipientAgentId,
        performative,
        delivered: true,
        conversationId: message.conversationId ?? conversationId,
        status: 'delivered',
      },
      {
        startedAt: t0,
        message: `Message delivered to ${recipientCard.name ?? recipientAgentId}`,
      }
    );
  } catch (err: any) {
    const msg = `A2A message delivery failed: ${err.message}`;
    consoleOutput.push(`${timestamp()} ❌ ${msg}`);
    return nodeError(msg, {}, { executionMs: Date.now() - t0 });
  }
}
