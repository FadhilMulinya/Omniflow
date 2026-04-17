import React from 'react';
import { Text } from 'ink';

export const loginCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    return <Text color="cyan">Initiating login sequence... (Device flow polling will render here)</Text>;
};
