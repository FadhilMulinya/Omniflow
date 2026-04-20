import React from 'react';
import { Text, Box, Newline } from 'ink';
import { COMMAND_REGISTRY } from '../index.js';

export const helpCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    const commands = Object.keys(COMMAND_REGISTRY).sort();

    return (
        <Box flexDirection="column" paddingLeft={1}>
            <Text color="cyan" bold underline>Onhandl Terminal - Help</Text>
            <Newline />
            <Text>Available commands:</Text>
            {commands.map(cmd => (
                <Text key={cmd}>  <Text color="green" bold>{cmd.padEnd(10)}</Text> - Execute {cmd}</Text>
            ))}
            <Newline />
            <Text color="gray">Usage: Type command and press Enter. Use Ctrl+C to exit chat mode.</Text>
        </Box>
    );
};
