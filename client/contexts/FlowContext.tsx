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
import { useToast } from '@/components/ui/notifications/use-toast';

interface FlowContextType {
  nodes: Node[];
  edges: Edge[];
  isConnected: boolean;
  walletAddress: string | null;
  reactFlowInstance: ReactFlowInstance | null;
  selectedNode: Node | null;
  consoleNode: Node | null;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setReactFlowInstance: React.Dispatch<React.SetStateAction<ReactFlowInstance | null>>;
  setSelectedNode: React.Dispatch<React.SetStateAction<Node | null>>;
  setConsoleNode: React.Dispatch<React.SetStateAction<Node | null>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  updateNodeData: (nodeId: string, newData: Partial<any>) => void;
  syncExecutionState: (executionState: Record<string, any>) => void;
  handleNodePlayPause: (nodeId: string) => void;
  handleNodeToggleActive: (nodeId: string) => void;
  handleDeleteNode: (nodeId: string) => void;
  handleOpenNodeConsole: (nodeId: string) => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [consoleNode, setConsoleNode] = useState<Node | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const onNodesChange = (changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  const onEdgesChange = useCallback((changes: any[]) => {
    // Check for edge removals and notify if any connected node was "playing"
    changes.forEach(change => {
      if (change.type === 'remove') {
        const removedEdge = edges.find(e => e.id === change.id);
        if (removedEdge) {
          const sourceNode = nodes.find(n => n.id === removedEdge.source);
          const targetNode = nodes.find(n => n.id === removedEdge.target);

          if ((sourceNode?.data?.isPlaying) || (targetNode?.data?.isPlaying)) {
            toast({
              title: "Chain Disconnected",
              description: `The connection between ${sourceNode?.data?.name || 'Source'} and ${targetNode?.data?.name || 'Target'} has been severed.`,
              variant: "destructive",
            });
          }
        }
      }
    });

    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [edges, nodes, toast]);

  const onConnect = (connection: any) => {
    setEdges((eds) => addEdge(connection, eds));

    // Vibrant console log for connection
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    console.log(
      `%c[Flow] Node Connected: ${sourceNode?.data?.name || 'Unknown'} -> ${targetNode?.data?.name || 'Unknown'}`,
      'color: #6366f1; font-weight: bold; background: #eef2ff; padding: 2px 6px; border-radius: 4px;'
    );
  };

  // Synchronize state from backend execution
  const syncExecutionState = useCallback((executionState: Record<string, any>) => {
    // Audit nodes for wallet data to log in console
    Object.values(executionState).forEach((nodeState: any) => {
      if (nodeState.outputData?.walletInfo?.address) {
        const addr = nodeState.outputData.walletInfo.address;
        if (addr !== walletAddress) {
          setWalletAddress(addr);
          setIsConnected(true);
          console.log(
            `%c[Wallet] Connected Address: ${addr}`,
            'color: #10b981; font-weight: bold; background: #ecfdf5; padding: 2px 6px; border-radius: 4px;'
          );
        }
      }
    });

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const nodeState = executionState[node.id];
        if (nodeState) {
          return {
            ...node,
            data: {
              ...node.data,
              inputValues: nodeState.inputValues,
              outputData: nodeState.outputData,
              consoleOutput: nodeState.consoleOutput,
              executionStatus: nodeState.status,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const handleNodePlayPause = useCallback(
    (nodeId: string) => {
      let shouldToast = false;

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const isPlaying = !node.data.isPlaying;
            // Backend handles execution now
            if (isPlaying) {
              shouldToast = true;
            }

            // Add a console message when play/pause state changes
            const consoleOutput = [
              ...((node.data.consoleOutput as any) || []),
              `[${new Date().toLocaleTimeString()}] Node ${isPlaying ? 'started' : 'paused'}`,
            ];

            if (isPlaying) {
              console.log(
                `%c[Node] Execution Started: ${node.data.name || 'Unknown'} (${node.id})`,
                'color: #f59e0b; font-weight: bold; background: #fffbeb; padding: 2px 6px; border-radius: 4px;'
              );
            }

            return {
              ...node,
              data: {
                ...node.data,
                isPlaying,
                consoleOutput,
              },
            };
          }
          return node;
        })
      );

      if (shouldToast) {
        toast({
          title: 'Execution Mode',
          description: 'Start simulation from the top panel to run the flow on the backend.',
        });
      }
    },
    [toast]
  );

  const handleNodeToggleActive = useCallback((nodeId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const isActive = node.data.isActive === false;

          // Add a console message when active state changes
          const consoleOutput = [
            ...((node.data.consoleOutput as any) || []),
            `[${new Date().toLocaleTimeString()}] Node ${isActive ? 'activated' : 'deactivated'}`,
          ];

          return {
            ...node,
            data: {
              ...node.data,
              isActive,
              isPlaying: isActive ? node.data.isPlaying : false,
              consoleOutput,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setSelectedNode((prev) => (prev?.id === nodeId ? null : prev));
      setConsoleNode((prev) => (prev?.id === nodeId ? null : prev));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));

      toast({
        title: 'Node deleted',
        description: 'The node has been removed from the flow.',
      });
    },
    [toast]
  );

  const handleOpenNodeConsole = useCallback(
    (nodeId: string) => {
      // Find the node in current state and update the console node separately
      // Avoid doing this inside a setNodes updater to prevent "update while rendering" errors
      const node = nodes.find(n => n.id === nodeId);
      if (node) setConsoleNode(node);
    },
    [nodes]
  );

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<any>) => {
      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      );
    },
    []
  );

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        isConnected,
        walletAddress,
        reactFlowInstance,
        selectedNode,
        consoleNode,
        setNodes,
        setEdges,
        setReactFlowInstance,
        setSelectedNode,
        setConsoleNode,
        onNodesChange,
        onEdgesChange,
        onConnect,
        updateNodeData,
        syncExecutionState,
        handleNodePlayPause,
        handleNodeToggleActive,
        handleDeleteNode,
        handleOpenNodeConsole,
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
