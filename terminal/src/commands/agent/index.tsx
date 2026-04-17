import React, { useEffect, useState } from 'react';
import { Box, Text, Newline } from 'ink';
import { apiClient } from '../../services/api.js';

export const agentCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    const subCommand = args[0] || 'list';

    if (subCommand === 'list') {
        return <AgentList />;
    }

    return (
        <Box flexDirection="column">
            <Text color="red">Unknown agent command: {subCommand}</Text>
            <Text>Available agent commands: list</Text>
        </Box>
    );
};

const AgentList = () => {
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient.get('/terminal/ops/agents')
            .then(res => {
                setAgents(res.data.agents || []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || err.message);
                setLoading(false);
            });
    }, []);

    if (loading) return <Text color="yellow">Fetching agents...</Text>;
    if (error) return <Text color="red">Error: {error}</Text>;
    if (agents.length === 0) return <Text>No agents found. Create one in the browser dashboard.</Text>;

    return (
        <Box flexDirection="column" marginTop={1}>
            <Box borderStyle="round" borderColor="gray" paddingX={1} flexDirection="column">
                <Box>
                    <Box width={24}><Text bold>ID</Text></Box>
                    <Box width={20}><Text bold>NAME</Text></Box>
                    <Box width={15}><Text bold>TYPE</Text></Box>
                    <Text bold>STATUS</Text>
                </Box>
                <Newsletter />
                {agents.map(agent => (
                    <Box key={agent.id}>
                        <Box width={24}><Text color="cyan">{agent.id.substring(0, 8)}...</Text></Box>
                        <Box width={20}><Text>{agent.name}</Text></Box>
                        <Box width={15}><Text color="magenta">{agent.agentType}</Text></Box>
                        <Text color={agent.isDraft ? 'yellow' : 'green'}>
                            {agent.isDraft ? 'Draft' : 'Published'}
                        </Text>
                    </Box>
                ))}
            </Box>
            <Newline />
        </Box>
    );
};

const Newsletter = () => <Text color="gray">{'-'.repeat(70)}</Text>;
