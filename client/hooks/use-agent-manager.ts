'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui';
import { useFlow } from '@/contexts/FlowContext';
import { apiFetch } from '@/lib/api-client';

export const useAgentManager = () => {
    const { nodes, edges, reactFlowInstance, setNodes, setEdges } = useFlow();
    const { toast } = useToast();

    const saveAgent = useCallback(async (name: string, description?: string) => {
        if (reactFlowInstance) {
            const flow = reactFlowInstance.toObject();
            try {
                await apiFetch('/agents', {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        description,
                        graph: {
                            nodes: flow.nodes,
                            edges: flow.edges,
                        },
                    }),
                });
                toast({
                    title: 'Agent saved',
                    description: 'Your agent has been saved to the cloud successfully.',
                });
            } catch (err: any) {
                toast({
                    title: 'Error',
                    description: err.message || 'Failed to save agent.',
                    variant: 'destructive',
                });
            }
        }
    }, [reactFlowInstance, toast]);

    const loadAgents = useCallback(async () => {
        try {
            const data = await apiFetch('/agents');
            if (data && data.length > 0) {
                // Load the first agent for now
                const agent = data[0];
                const graph = agent.graph;

                setNodes(graph.nodes || []);
                setEdges(graph.edges || []);

                toast({
                    title: 'Agent loaded',
                    description: `Loaded agent: ${agent.name}`,
                });
            }
        } catch (err: any) {
            toast({
                title: 'Error',
                description: 'Failed to load agents.',
                variant: 'destructive',
            });
        }
    }, [setNodes, setEdges, toast]);

    return { saveAgent, loadAgents };
};
