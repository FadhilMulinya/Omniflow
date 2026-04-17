import React, { useState, useEffect } from 'react';
import { Box } from 'ink';
import { WelcomeHeader } from './shell/ui.js';
import { Repl } from './shell/repl.js';
import { SessionStore } from './services/session.js';
import { TerminalSession } from './types.js';

export const App = () => {
    const [session, setSession] = useState<TerminalSession | null>(null);

    useEffect(() => {
        setSession(SessionStore.load());
    }, []);

    return (
        <Box flexDirection="column">
            <WelcomeHeader session={session} />
            <Repl session={session} setSession={setSession} />
        </Box>
    );
};
