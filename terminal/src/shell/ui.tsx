import React from 'react';
import { Box, Text } from 'ink';

export const WelcomeHeader = ({ session }: { session: any }) => {
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Box>
                <Text color="blue" bold>Onhandl Terminal Workspace</Text>
            </Box>
            {!session ? (
                <Box>
                    <Text color="yellow">! You are not currently logged in. Please run `login` to authenticate.</Text>
                </Box>
            ) : (
                <Box>
                    <Text color="green">✔ Authenticated explicitly as {session.deviceName}</Text>
                </Box>
            )}
        </Box>
    );
};
