'use client';

import type React from 'react';
import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import {
  type Node,
  type Edge,
  type ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { propagateOutputToConnectedNodes, simulateNode } from '@/lib/simulation';

interface FlowContextType {
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
  selectedNode: Node | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setReactFlowInstance: React.Dispatch<React.SetStateAction<ReactFlowInstance | null>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  updateNodeData: (nodeId: string, newData: Partial<any>) => void;
  cascadeNodeExecution: (nodeId: string) => Promise<void>;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodesChange = (changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = (changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const onConnect = (connection: any) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  // Cascade execution to downstream nodes
  const cascadeNodeExecution = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      try {
        console.log(`Starting cascade execution for node: ${nodeId} (${node.data.name})`);

        // Execute the current node
        const result = await simulateNode(node, nodes, edges);
        console.log(`Execution result for node ${nodeId}:`, result);

        // Update the current node with execution results
        setNodes((currentNodes) =>
          currentNodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    outputData: result.outputData,
                    consoleOutput: result.consoleOutput,
                    executionStatus: result.executionStatus,
                  },
                }
              : n
          )
        );

        // Find all downstream nodes that need to be updated
        const updatedNodeIds = propagateOutputToConnectedNodes(
          nodeId,
          result.outputData,
          nodes,
          edges
        );
        console.log(`Nodes to update after ${nodeId} execution:`, updatedNodeIds);

        // Execute each downstream node in sequence
        for (const targetNodeId of updatedNodeIds) {
          await cascadeNodeExecution(targetNodeId);
        }
      } catch (error) {
        console.error(`Error cascading execution from node ${nodeId}:`, error);
      }
    },
    [nodes, edges]
  );

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<any>) => {
      // First, update the target node
      setNodes((currentNodes) => {
        return currentNodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        );
      });

      // If the node has outputData, trigger cascading updates
      if (newData.outputData) {
        // Use setTimeout to ensure the node update is processed first
        setTimeout(() => {
          const updatedNodeIds = propagateOutputToConnectedNodes(
            nodeId,
            newData.outputData,
            nodes,
            edges
          );

          // Execute each downstream node
          updatedNodeIds.forEach((targetNodeId) => {
            const targetNode = nodes.find((n) => n.id === targetNodeId);
            if (targetNode && targetNode.data.isActive !== false) {
              cascadeNodeExecution(targetNodeId);
            }
          });
        }, 0);
      }
    },
    [nodes, edges, cascadeNodeExecution]
  );

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        reactFlowInstance,
        selectedNode,
        setNodes,
        setEdges,
        setReactFlowInstance,
        setSelectedNode,
        onNodesChange,
        onEdgesChange,
        onConnect,
        updateNodeData,
        cascadeNodeExecution,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};
