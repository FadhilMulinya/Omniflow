'use client';

import { getNodeResult, isNodeOutput, NodeOutput } from '@/lib/nodes/types';

interface NodeOutputDisplayProps {
  nodeType: string;
  nodeName: string;
  outputData: NodeOutput | Record<string, unknown> | null | undefined;
}

export default function NodeOutputDisplay({ nodeType, nodeName, outputData }: NodeOutputDisplayProps) {
  if (!outputData) return null;

  const envelope = isNodeOutput(outputData) ? outputData : null;
  const result = getNodeResult(outputData) as Record<string, unknown>;

  // Envelope-level error badge
  const isError = envelope?.status === 'error';

  return (
    <div className="mt-2 space-y-1">
      {/* Status / confidence bar — only for v2 envelope */}
      {envelope && (
        <div className="flex items-center justify-between text-[10px] text-gray-400 px-1">
          <span className={isError ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
            {isError ? '✗ error' : '✓ success'}
          </span>
          <span>conf: {(envelope.confidence * 100).toFixed(0)}%</span>
          {envelope.metadata?.executionMs !== undefined && (
            <span>{envelope.metadata.executionMs}ms</span>
          )}
        </div>
      )}

      {/* Error message */}
      {isError && envelope?.message && (
        <div className="px-2 py-1 bg-red-50 border border-red-200 rounded text-[10px] text-red-600">
          {envelope.message}
        </div>
      )}

      {/* Node-specific result display */}
      {!isError && (
        <NodeResultDisplay nodeType={nodeType} nodeName={nodeName} result={result} envelope={envelope} />
      )}
    </div>
  );
}

// ─── Node-specific displays ───────────────────────────────────────────────────

function NodeResultDisplay({
  nodeType,
  nodeName,
  result,
  envelope,
}: {
  nodeType: string;
  nodeName: string;
  result: Record<string, unknown>;
  envelope: NodeOutput | null;
}) {
  switch (nodeType) {
    case 'output':
      return <OutputResultDisplay nodeName={nodeName} result={result} />;
    case 'input':
      return <InputResultDisplay result={result} />;
    case 'processing':
      return <ProcessingResultDisplay nodeName={nodeName} result={result} envelope={envelope} />;
    case 'condition':
      return <ConditionResultDisplay result={result} />;
    case 'blockchain_tool':
      return <BlockchainResultDisplay result={result} envelope={envelope} />;
    case 'crypto_wallet':
      return <WalletResultDisplay result={result} />;
    case 'crypto_trade':
      return <TradeResultDisplay result={result} />;
    case 'agent_call':
      return <A2AResultDisplay result={result} />;
    default:
      return <GenericResultDisplay result={result} />;
  }
}

function OutputResultDisplay({ nodeName, result }: { nodeName: string; result: Record<string, unknown> }) {
  if (nodeName === 'Text Output') {
    return (
      <div className="p-2 bg-gray-50 border rounded-md">
        <div className="text-[10px] text-gray-500 mb-1">Output Preview</div>
        <div className="text-xs whitespace-pre-wrap">{String(result.displayText ?? 'No output')}</div>
      </div>
    );
  }
  return <GenericResultDisplay result={result} />;
}

function InputResultDisplay({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="p-2 bg-gray-50 border rounded-md">
      <div className="text-[10px] text-gray-500 mb-1">
        Input captured <span className="capitalize">({String(result.inputType ?? 'text')})</span>
      </div>
      <div className="text-xs truncate">{String(result.value ?? '')}</div>
    </div>
  );
}

function ProcessingResultDisplay({
  nodeName,
  result,
  envelope,
}: {
  nodeName: string;
  result: Record<string, unknown>;
  envelope: NodeOutput | null;
}) {
  const intent = result.intent as string | undefined;
  const message = result.message as string | undefined;
  const tokenUsage = envelope?.metadata?.tokenUsage;
  const model = envelope?.metadata?.modelUsed;

  return (
    <div className="p-2 bg-gray-50 border rounded-md max-h-40 overflow-y-auto space-y-1">
      {model && (
        <div className="text-[10px] text-gray-400">Model: {model}</div>
      )}
      {intent && (
        <div className="text-[10px]">
          <span className="text-gray-500">Intent: </span>
          <span className="font-medium capitalize">{intent}</span>
        </div>
      )}
      {message && (
        <div className="text-xs font-mono whitespace-pre-wrap">{message}</div>
      )}
      {tokenUsage && (
        <div className="pt-1 border-t border-gray-200 grid grid-cols-3 gap-1 text-[10px] text-gray-400">
          <span>P: {tokenUsage.prompt}</span>
          <span>C: {tokenUsage.completion}</span>
          <span>T: {tokenUsage.total}</span>
        </div>
      )}
    </div>
  );
}

function ConditionResultDisplay({ result }: { result: Record<string, unknown> }) {
  const matched = result.conditionResult as boolean | undefined;
  const branch = result.matchedBranch as string | undefined;
  return (
    <div className="p-2 bg-gray-50 border rounded-md">
      <div className="text-[10px] text-gray-500 mb-1">Condition Result</div>
      <div className={`text-xs font-medium ${matched ? 'text-green-600' : 'text-red-600'}`}>
        {matched ? '✓ Matched' : '✗ No match'}
        {branch && <span className="ml-1 text-gray-500">→ {branch}</span>}
      </div>
    </div>
  );
}

function BlockchainResultDisplay({
  result,
  envelope,
}: {
  result: Record<string, unknown>;
  envelope: NodeOutput | null;
}) {
  const data = result.data as any;
  const network = envelope?.metadata?.network ?? result.network;
  const toolName = envelope?.metadata?.toolName ?? result.toolName;

  return (
    <div className="p-2 bg-gray-50 border rounded-md">
      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
        <span>{String(toolName ?? 'Blockchain')}</span>
        <span>{String(network ?? '')}</span>
      </div>
      {data?.ckb !== undefined && (
        <div className="text-xs font-medium">{data.ckb} CKB</div>
      )}
      {data?.hash && (
        <div className="text-[10px] text-gray-400 truncate">TxHash: {data.hash}</div>
      )}
      {!data?.ckb && !data?.hash && (
        <pre className="text-[10px] overflow-auto max-h-16">{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}

function WalletResultDisplay({ result }: { result: Record<string, unknown> }) {
  const connected = result.connected as boolean;
  return (
    <div className="p-2 bg-gray-50 border rounded-md space-y-0.5">
      <div className={`text-[10px] font-medium ${connected ? 'text-green-600' : 'text-red-500'}`}>
        {connected ? '● Connected' : '○ Disconnected'}
      </div>
      {connected && (
        <>
          <div className="text-[10px] text-gray-500 truncate">
            {String(result.address ?? '')}
          </div>
          <div className="text-[10px] text-gray-400">
            {String(result.balance ?? '0')} {String(result.currency ?? '')} · {String(result.network ?? '')}
          </div>
        </>
      )}
    </div>
  );
}

function TradeResultDisplay({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="p-2 bg-gray-50 border rounded-md space-y-0.5">
      <div className="text-[10px] font-medium text-green-600">Trade Executed</div>
      <div className="text-[10px] text-gray-600">
        {String(result.action ?? '')} {String(result.amount ?? '')} {String(result.token ?? '')} @ ${String(result.price ?? '')}
      </div>
      <div className="text-[10px] text-gray-400 truncate">
        Tx: {String(result.transactionId ?? '—')}
      </div>
    </div>
  );
}

function A2AResultDisplay({ result }: { result: Record<string, unknown> }) {
  const delivered = result.delivered as boolean;
  return (
    <div className="p-2 bg-violet-50 border border-violet-100 rounded-md space-y-0.5">
      <div className={`text-[10px] font-medium ${delivered ? 'text-green-600' : 'text-red-500'}`}>
        {delivered ? '✓ Message Delivered' : '✗ Delivery Failed'}
      </div>
      <div className="text-[10px] text-violet-600 capitalize">{String(result.performative ?? '')}</div>
      {!!result.messageId && (
        <div className="text-[10px] text-gray-400 truncate">ID: {String(result.messageId)}</div>
      )}
    </div>
  );
}

function GenericResultDisplay({ result }: { result: Record<string, unknown> }) {
  return (
    <div className="p-2 bg-gray-50 border rounded-md">
      <div className="text-[10px] text-gray-500 mb-1">Output</div>
      <pre className="text-[10px] overflow-auto max-h-20">{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
