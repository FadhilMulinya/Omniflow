import React from 'react';
import { Text, Box, Newline } from 'ink';
import { COMMAND_REGISTRY } from '../index.js';

export const helpCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    const { session } = context;
    const allCommands = Object.keys(COMMAND_REGISTRY).sort();

    // Commands visible even when not logged in
    const publicCommands = ['help', 'login', 'exit', 'quit', 'whoami'];

    // Filter commands based on session
    const visibleCommands = session
        ? allCommands
        : allCommands.filter(cmd => publicCommands.includes(cmd));

    return (
        <Box flexDirection="column" paddingLeft={1}>
            <Text color="cyan" bold underline>Onhandl Terminal - Help</Text>
            <Newline />
            <Text>{session ? 'Available commands:' : 'Please login to access all commands:'}</Text>
            {visibleCommands.map(cmd => (
                <Text key={cmd}>  <Text color="green" bold>{cmd.padEnd(10)}</Text> - Execute {cmd}</Text>
            ))}
            <Newline />
            <Text color="gray">Usage: Type command and press Enter. Use Ctrl+C to exit chat mode.</Text>
        </Box>
    );
};
