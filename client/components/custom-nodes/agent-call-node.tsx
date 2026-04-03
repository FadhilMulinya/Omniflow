'use client';

import { Handle, Position } from '@xyflow/react';
import { Bot, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { NodeOutput, A2ANodeResult } from '@/lib/nodes/types';

interface AgentCallNodeProps {
  data: {
    name: string;
    description?: string;
    inputs?: { key: string; label: string; value?: string }[];
    outputs?: { key: string; label: string }[];
    isPlaying?: boolean;
    executionStatus?: 'success' | 'error' | 'pending' | null;
    outputData?: NodeOutput<A2ANodeResult> | null;
  };
  isConnectable: boolean;
  selected: boolean;
}

export default function AgentCallNode({ data, isConnectable, selected }: AgentCallNodeProps) {
  const { isPlaying, executionStatus, outputData } = data;
  const result = outputData?.result;

  const statusIcon = () => {
    if (!isPlaying) return null;
    if (executionStatus === 'success') return <CheckCircle className="w-3 h-3 text-green-500" />;
    if (executionStatus === 'error') return <XCircle className="w-3 h-3 text-red-500" />;
    return <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />;
  };

  const recipientId = data.inputs?.find(i => i.key === 'recipientAgentId')?.value ?? '—';
  const performative = data.inputs?.find(i => i.key === 'performative')?.value ?? 'request';

  return (
    <div
      className={`bg-white border-2 rounded-xl shadow-sm min-w-[200px] max-w-[240px] transition-all ${
        selected ? 'border-violet-500 shadow-violet-100 shadow-md' : 'border-violet-200'
      }`}
    >
      {/* Header */}
      <div className="bg-violet-50 px-3 py-2 rounded-t-xl flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-violet-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-violet-900 truncate">{data.name}</div>
          <div className="text-[10px] text-violet-500">A2A</div>
        </div>
        {statusIcon()}
      </div>

      {/* Body */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="text-[10px] text-gray-500 truncate">
          <span className="font-medium text-gray-700">To:</span> {recipientId}
        </div>
        <div className="text-[10px] text-gray-500">
          <span className="font-medium text-gray-700">Performative:</span>{' '}
          <span className="capitalize">{performative}</span>
        </div>

        {/* Outputs */}
        <div className="pt-1 space-y-1">
          {(data.outputs ?? []).map(output => (
            <div key={output.key} className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500">{output.label}</span>
              <div className="relative flex items-center">
                <Handle
                  type="source"
                  position={Position.Right}
                  id={output.key}
                  isConnectable={isConnectable}
                  className="!w-2 !h-2 !bg-violet-400 !border-white !border !rounded-full !right-[-8px]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Live result */}
        {isPlaying && result && (
          <div className="mt-2 p-2 bg-violet-50 border border-violet-100 rounded-md">
            <div className="text-[10px] font-medium text-violet-700 mb-1">Delivery Status</div>
            <div className="flex items-center gap-1">
              {result.delivered ? (
                <CheckCircle className="w-3 h-3 text-green-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
              <span className="text-[10px] text-gray-600 capitalize">{result.status}</span>
            </div>
            {result.messageId && (
              <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                ID: {result.messageId}
              </div>
            )}
            {outputData?.confidence !== undefined && (
              <div className="text-[10px] text-gray-400 mt-0.5">
                Confidence: {(outputData.confidence * 100).toFixed(0)}%
              </div>
            )}
          </div>
        )}
      </div>

      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!w-2 !h-2 !bg-violet-400 !border-white !border !rounded-full"
      />
    </div>
  );
}
