import React, { useEffect, useState } from 'react';
import { Box, Text, Newline } from 'ink';
import { apiClient } from '../../services/api.js';
import { SessionStore } from '../../services/session.js';

export const execCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    const subCommand = args[0];
    const targetId = args[1];

    if (subCommand === 'start') {
        if (!targetId) return <Text color="red">Usage: exec start &lt;agentId&gt;</Text>;
        return <ExecStart agentId={targetId} />;
    }

    if (subCommand === 'watch') {
        if (!targetId) return <Text color="red">Usage: exec watch &lt;executionId&gt;</Text>;
        return <ExecWatch executionId={targetId} />;
    }

    return (
        <Box flexDirection="column">
            <Text color="red">Unknown exec command: {subCommand}</Text>
            <Text>Available exec commands: start &lt;agentId&gt;, watch &lt;executionId&gt;</Text>
        </Box>
    );
};

const ExecStart = ({ agentId }: { agentId: string }) => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiClient.post('/terminal/ops/executions', { agentId })
            .then(res => {
                setResult(res.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.response?.data?.error || err.message);
                setLoading(false);
            });
    }, [agentId]);

    if (loading) return <Text color="yellow">Starting execution for agent {agentId}...</Text>;
    if (error) return <Text color="red">Error starting execution: {error}</Text>;

    return (
        <Box flexDirection="column" marginTop={1}>
            <Text color="green">✔ Execution started successfully!</Text>
            <Text>Execution ID: <Text color="cyan" bold>{result?.executionId}</Text></Text>
            <Text>Status: <Text color="yellow">{result?.status}</Text></Text>
            <Box marginTop={1}>
                <Text>Run: <Text color="blue">exec watch {result?.executionId}</Text> to see real-time logs.</Text>
            </Box>
        </Box>
    );
};

const ExecWatch = ({ executionId }: { executionId: string }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<string>('connecting');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        const startWatching = async () => {
            const API_BASE_URL = process.env.ONHANDL_API_URL || 'http://localhost:3001/api';
            const session = SessionStore.load();

            try {
                const response = await fetch(`${API_BASE_URL}/terminal/ops/executions/${executionId}/watch`, {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`
                    },
                    signal: controller.signal
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                setStatus('watching');
                const reader = response.body?.getReader();
                if (!reader) throw new Error('ReadableStream not supported');

                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.trim().startsWith('data: ')) {
                            try {
                                const jsonStr = line.replace('data: ', '').trim();
                                if (!jsonStr) continue;
                                const data = JSON.parse(jsonStr);

                                if (data.consoleOutput) {
                                    setLogs(prev => [...prev, ...data.consoleOutput]);
                                }
                                if (data.status) setStatus(data.status);
                                if (data.status === 'completed' || data.status === 'failed') {
                                    return;
                                }
                            } catch (e) { }
                        }
                    }
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') setError(err.message);
            }
        };

        startWatching();
        return () => controller.abort();
    }, [executionId]);

    if (error) return <Text color="red">Watch Error: {error}</Text>;

    return (
        <Box flexDirection="column" marginTop={1}>
            <Box marginBottom={1}>
                <Text bold>Streaming Logs for <Text color="cyan">{executionId}</Text></Text>
                <Text color="gray"> [Status: {status}]</Text>
            </Box>
            <Box flexDirection="column">
                {logs.length === 0 && status === 'connecting' && <Text color="gray">Connecting to stream...</Text>}
                {logs.map((log, i) => (
                    <Text key={i}>{log}</Text>
                ))}
            </Box>
            {(status === 'completed' || status === 'failed') && (
                <Box marginTop={1}>
                    <Text color={status === 'completed' ? 'green' : 'red'}>
                        🏁 Execution {status === 'completed' ? 'finished' : 'failed'}.
                    </Text>
                </Box>
            )}
        </Box>
    );
};
