import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui';
import { useFlow } from '@/contexts/FlowContext';
import { Node, Edge } from '@xyflow/react';

export const useLocalStorage = () => {
  const { nodes, edges, reactFlowInstance, setNodes, setEdges } = useFlow();
  const { toast } = useToast();

  const saveFlow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      localStorage.setItem('ai-flow', JSON.stringify(flow));
      toast({
        title: 'Flow saved',
        description: 'Your flow has been saved successfully.',
      });
    }
  }, [reactFlowInstance, toast]);

  const loadFlow = useCallback(() => {
    const savedFlow = localStorage.getItem('ai-flow');
    if (savedFlow) {
      const flow = JSON.parse(savedFlow);

      const nodesWithHandlers = flow.nodes.map((node: Node) => ({
        ...node,
        data: {
          ...node.data,
          isActive: node.data.isActive !== false,
          isPlaying: node.data.isPlaying || false,
          consoleOutput: node.data.consoleOutput || [],
        },
      }));

      setNodes(nodesWithHandlers || []);
      setEdges(flow.edges || []);

      toast({
        title: 'Flow loaded',
        description: 'Your flow has been loaded successfully.',
      });
    }
  }, [setNodes, setEdges, toast]);

  return { saveFlow, loadFlow };
};
