'use client';

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { Node } from '@xyflow/react';
import { useFlow } from './FlowContext';
import { useToast } from '@/components/ui';
import { simulateNode } from '@/lib/simulation';

interface NodeContextType {
  handleNodePlayPause: (nodeId: string) => void;
  handleNodeToggleActive: (nodeId: string) => void;
  handleDeleteNode: (nodeId: string) => void;
  handleOpenNodeConsole: (nodeId: string) => void;
  updateNodeData: (nodeId: string, newData: Partial<Node['data']>) => void;
}

const NodeContext = createContext<NodeContextType | undefined>(undefined);

export const NodeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { nodes, edges, setNodes } = useFlow();
  const { toast } = useToast();

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<Node['data']>) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    [setNodes]
  );

  const handleNodePlayPause = useCallback(
    async (nodeId: string) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === nodeId) {
            const isPlaying = !node.data.isPlaying;

            // If starting to play, simulate the node
            if (isPlaying) {
              simulateNode(node, nodes, edges)
                .then((result) => {
                  updateNodeData(nodeId, {
                    isPlaying,
                    consoleOutput: result.consoleOutput,
                    outputData: result.outputData,
                    executionStatus: result.executionStatus,
                  });
                })
                .catch((error) => {
                  console.error(`Simulation error for node ${nodeId}: `, error);
                });
            }

            return {
              ...node,
              data: {
                ...node.data,
                isPlaying,
                consoleOutput: [
                  ...((node.data.consoleOutput as any) || []),
                  `[${new Date().toLocaleTimeString()}] Node ${isPlaying ? 'started' : 'paused'} `,
                ],
              },
            };
          }
          return node;
        })
      );
    },
    [nodes, edges, setNodes, updateNodeData]
  );

  const handleNodeToggleActive = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === nodeId) {
            const isActive = node.data.isActive === false;
            return {
              ...node,
              data: {
                ...node.data,
                isActive,
                isPlaying: isActive ? node.data.isPlaying : false,
                consoleOutput: [
                  ...((node.data.consoleOutput as any) || []),
                  `[${new Date().toLocaleTimeString()}] Node ${isActive ? 'activated' : 'deactivated'} `,
                ],
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((currentNodes) => currentNodes.filter((node) => node.id !== nodeId));

      toast({
        title: 'Node Deleted',
        description: 'The node has been removed from the flow.',
      });
    },
    [setNodes, toast]
  );

  const handleOpenNodeConsole = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      // Implement console opening logic
    },
    [nodes]
  );

  return (
    <NodeContext.Provider
      value={{
        handleNodePlayPause,
        handleNodeToggleActive,
        handleDeleteNode,
        handleOpenNodeConsole,
        updateNodeData,
      }}
    >
      {children}
    </NodeContext.Provider>
  );
};

export const useNodeOperations = () => {
  const context = useContext(NodeContext);
  if (!context) {
    throw new Error('useNodeOperations must be used within a NodeProvider');
  }
  return context;
};
