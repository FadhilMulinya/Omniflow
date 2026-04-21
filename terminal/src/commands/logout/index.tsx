import React from 'react';
import { Text } from 'ink';
import { SessionStore } from '../../services/session.js';

export const logoutCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    const { setSession } = context;

    SessionStore.clear();
    if (setSession) {
        setSession(null);
    }

    // Exit using the Ink exit function from context
    if (context.exit) {
        context.exit();
    } else {
        process.exit(0);
    }

    return <Text color="green">✔ Logged out successfully. Your local session has been cleared.</Text>;
};
