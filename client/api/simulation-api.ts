import { apiFetch } from '@/lib/api-client';
import type { NodeOutput } from '@/lib/nodes/types';

export interface NodeSimulateRequest {
  nodeType: string;
  nodeData: Record<string, unknown>;
  inputValues?: Record<string, unknown>;
  agentId?: string;
}

export interface NodeSimulateResponse {
  output: NodeOutput<object>;
  consoleOutput: string[];
}

export const simulationApi = {
  simulateNode: (body: NodeSimulateRequest): Promise<NodeSimulateResponse> =>
    apiFetch('/simulate/node', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
