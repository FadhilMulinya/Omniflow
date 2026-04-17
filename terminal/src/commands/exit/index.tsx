import React from 'react';
import { Text } from 'ink';

export const exitCommand = (args: string[], context: any): React.ReactNode => {
    process.exit(0);
    return <Text>Goodbye!</Text>;
};
