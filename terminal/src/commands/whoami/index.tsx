import React from 'react';
import { Box, Text, Newline } from 'ink';

export const whoamiCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    const { session } = context;

    if (!session) {
        return <Text color="yellow">! You are not currently logged in. Run `login` to authenticate.</Text>;
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
                <Text color="cyan">{session.user.username}</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Workspace:</Text></Box>
                <Text color="cyan">{session.workspace.name} ({session.workspace.id})</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Device Name:</Text></Box>
                <Text color="cyan">{session.deviceName || 'Primary Terminal'}</Text>
            </Box>
            <Box>
                <Box width={15}><Text bold>Expires At:</Text></Box>
                <Text color="gray">{new Date(session.expiresAt).toLocaleString()}</Text>
            </Box>
        </Box>
    );
};
