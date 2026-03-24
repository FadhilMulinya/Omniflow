'use client';

import type React from 'react';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  type Node,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button, toast, useToast } from '@/components/ui';
import { Play, Pause, Plus, Save, Upload, Key } from 'lucide-react';
import NodeLibrary from '@/components/node-library';
import NodeSidebar from '@/components/node-sidebar';
import NodeConsoleModal from '@/components/node-console-modal';
import ApiKeyModal from '@/components/api-key-modal';
import { nodeTypes } from '@/lib/node-types';

import FlowConsole from '@/components/flow-console';

import { useFlow, useSimulation } from '@/contexts';
import { useApiKeyManager, useLocalStorage, useAgentManager } from '@/hooks';

export default function FlowBuilder() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [consoleNode, setConsoleNode] = useState<Node | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  // const { toast } = useToast()

  // hooks and context states
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNode,
    setSelectedNode,
    setReactFlowInstance,
    reactFlowInstance,
    updateNodeData,
    cascadeNodeExecution,
  } = useFlow();

  const { isSimulating, toggleSimulation } = useSimulation();
  const { handleSaveApiKey } = useApiKeyManager();
  const { saveAgent, loadAgents } = useAgentManager();

  // Simulation interval reference
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Update the handleNodePlayPause function to better handle node execution
  const handleNodePlayPause = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            const isPlaying = !node.data.isPlaying;

            // Add a console message when play/pause state changes
            const consoleOutput = [
              ...((node.data.consoleOutput as any) || []),
              `[${new Date().toLocaleTimeString()}] Node ${isPlaying ? 'started' : 'paused'}`,
            ];

            // If starting to play, run simulation for this node
            if (isPlaying) {
              // We'll run the simulation in the next tick
              setTimeout(async () => {
                try {
                  console.log(`Starting simulation for node ${nodeId} (${node.data.name})`);
                  // Use cascadeNodeExecution to trigger updates to downstream nodes
                  await cascadeNodeExecution(nodeId);
                } catch (error) {
                  console.error(`Error simulating node ${nodeId}:`, error);
                }
              }, 0);
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
    },
    [setNodes, cascadeNodeExecution]
  );

  const handleNodeToggleActive = useCallback(
    (nodeId: string) => {
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
                isPlaying: isActive ? node.data.isPlaying : false, // Stop playing if deactivated
                consoleOutput,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleOpenNodeConsole = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setConsoleNode(node);
      }
    },
    [nodes]
  );

  // Delete node handler
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      // First, close the sidebar if the deleted node is selected
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null);
      }

      // Close console modal if open for this node
      if (consoleNode && consoleNode.id === nodeId) {
        setConsoleNode(null);
      }

      // Remove all edges connected to this node
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));

      // Remove the node
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));

      // Show toast notification
      toast({
        title: 'Node deleted',
        description: 'The node has been removed from the flow.',
      });
    },
    [setNodes, setEdges, selectedNode, consoleNode, toast]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is valid
      if (typeof type === 'undefined' || !type || !reactFlowBounds || !reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeData = JSON.parse(event.dataTransfer.getData('application/nodeData'));

      // Add node control handlers and state
      const enhancedNodeData = {
        ...nodeData,
        isActive: true,
        isPlaying: false,
        consoleOutput: [],
        outputData: null,
        executionStatus: null,
        onPlayPause: handleNodePlayPause,
        onToggleActive: handleNodeToggleActive,
        onOpenConsole: handleOpenNodeConsole,
        onDeleteNode: handleDeleteNode,
        onUpdateNodeData: updateNodeData, // Add this line
      };

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: enhancedNodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [
      reactFlowInstance,
      setNodes,
      handleNodePlayPause,
      handleNodeToggleActive,
      handleOpenNodeConsole,
      handleDeleteNode,
      updateNodeData,
    ]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // Add a useEffect to show simulation mode toast
  useEffect(() => {
    toast({
      title: 'Decoupled Backend',
      description: 'Flow execution is now handled by the Fastify backend.',
      duration: 5000,
    });
  }, [toast]);

  return (
    <div className="flex h-screen w-full">
      <ReactFlowProvider>
        <div className="flex-1 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="top-right" className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSimulation}
                className={isSimulating ? 'bg-destructive/10 text-destructive border-destructive/20' : ''}
              >
                {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsLibraryOpen(!isLibraryOpen)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => saveAgent('My New Bot', 'Optimized bot')}>
                <Save className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={loadAgents}>
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsApiKeyModalOpen(true)}>
                <Key className="h-4 w-4" />
              </Button>
            </Panel>
            {isLibraryOpen && (
              <Panel position="top-left" className="bg-card p-6 rounded-xl shadow-2xl border border-border">
                <NodeLibrary onClose={() => setIsLibraryOpen(false)} />
              </Panel>
            )}
          </ReactFlow>
        </div>
        {selectedNode && (
          <NodeSidebar
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            updateNodeData={updateNodeData}
          />
        )}
        {consoleNode && (
          <NodeConsoleModal
            nodeId={consoleNode.id}
            nodeName={consoleNode.data.name as string}
            consoleOutput={(consoleNode.data.consoleOutput as string[]) || []}
            onClose={() => setConsoleNode(null)}
          />
        )}
        {isApiKeyModalOpen && (
          <ApiKeyModal onClose={() => setIsApiKeyModalOpen(false)} onSave={handleSaveApiKey} />
        )}
        <FlowConsole />
      </ReactFlowProvider>
    </div>
  );
}
