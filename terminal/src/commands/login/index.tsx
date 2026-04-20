import React, { useEffect, useState } from 'react';
import { Box, Text, Newline } from 'ink';
import { apiClient } from '../../services/api.js';
import { SessionStore } from '../../services/session.js';
import open from 'open';

export const loginCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    return <LoginFlow setSession={context.setSession} />;
};

const LoginFlow = ({ setSession }: { setSession: (s: any) => void }) => {
    const [step, setStep] = useState<'starting' | 'polling' | 'success' | 'failed'>('starting');
    const [authData, setAuthData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const start = async () => {
            try {
                const { data } = await apiClient.post('/terminal/auth/start', { init: true });
                setAuthData(data);
                setStep('polling');
                if (data.loginUrl) await open(data.loginUrl);
            } catch (err: any) {
                setError(err.response?.data?.error || err.message);
                setStep('failed');
            }
        };
        start();
    }, []);

    useEffect(() => {
        if (step !== 'polling' || !authData) return;

        const interval = setInterval(async () => {
            try {
                const { data } = await apiClient.post('/terminal/auth/poll', {
                    deviceCode: authData.deviceCode
                });

                if (data.status === 'approved') {
                    clearInterval(interval);
                    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                    const newSession = {
                        accessToken: data.accessToken,
                        user: { id: data.userId || '', username: 'Authenticated User' },
                        workspace: { id: data.workspaceId || '', name: 'Default Workspace' },
                        deviceName: data.deviceName || 'Terminal',
                        expiresAt
                    };
                    SessionStore.save(newSession);
                    setSession(newSession);
                    setStep('success');
                } else if (data.status === 'denied' || data.status === 'expired') {
                    clearInterval(interval);
                    setStep('failed');
                    setError(`Login ${data.status}`);
                }
            } catch (err) {
                // Ignore transient errors during polling
            }
        }, (authData.pollInterval || 5) * 1000);

        return () => clearInterval(interval);
    }, [step, authData, setSession]);

    if (step === 'starting') return <Text color="yellow">Initiating secure login...</Text>;

    if (step === 'failed') return <Text color="red">Login failed: {error}</Text>;

    if (step === 'success') return <Text color="green">✔ Login successful! Welcome to Onhandl.</Text>;

    return (
        <Box flexDirection="column" borderStyle="round" borderColor="cyan" padding={1}>
            <Text bold color="cyan">DEVICE AUTHENTICATION REQUIRED</Text>
            <Newline />
            <Text>Please visit: <Text color="blue" underline>{authData.loginUrl}</Text></Text>
            <Text>And enter code: <Text bold color="yellow">{authData.userCode}</Text></Text>
            <Newline />
            <Text color="gray">Waiting for approval...</Text>
        </Box>
    );
};
