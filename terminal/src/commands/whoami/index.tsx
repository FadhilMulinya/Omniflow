import React from 'react';
import { Box, Text, Newline } from 'ink';
import { apiClient } from '../../services/api.js';

export const whoamiCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    const { session } = context;

    if (!session) {
        return <Text color="yellow">! You are not currently logged in. Run `login` to authenticate.</Text>;
    }

    let userDetails = {
        username: session.user.username,
        plan: 'Unknown',
        tokens: 0,
        agentsCount: 0
    };

    try {
        const [profileRes, agentsRes] = await Promise.all([
            apiClient.get('/auth/me'),
            apiClient.get('/terminal/agents')
        ]);

        userDetails = {
            username: profileRes.data.username || session.user.username,
            plan: profileRes.data.plan || 'Free',
            tokens: profileRes.data.tokens || 0,
            agentsCount: agentsRes.data.agents?.length || 0
        };
    } catch (err) {
        // Fallback to session data if API fails, but ensure username is visible
        userDetails.username = session.user.username;
    }

    return (
        <Box flexDirection="column" paddingLeft={1}>
            <Text color="green" bold underline>WHOAMI (Session Info)</Text>
            <Newline />
            <Box>
                <Box width={15}><Text bold>User ID:</Text></Box>
                <Text color="cyan">{session.user.id}</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Username:</Text></Box>
                <Text color="cyan">{userDetails.username}</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Workspace:</Text></Box>
                <Text color="cyan">{session.workspace.name} ({session.workspace.id})</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Plan:</Text></Box>
                <Text color="yellow" bold>{userDetails.plan.toUpperCase()}</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Total Agents:</Text></Box>
                <Text color="magenta">{userDetails.agentsCount}</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Tokens Left:</Text></Box>
                <Text color="green">{userDetails.tokens.toLocaleString()}</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Expires At:</Text></Box>
                <Text color="gray">{new Date(session.expiresAt).toLocaleString()}</Text>
            </Box>
        </Box>
    );
};
