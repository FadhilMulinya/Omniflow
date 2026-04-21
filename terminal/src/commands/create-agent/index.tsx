import React, { useState, useEffect } from 'react';
import { Box, Text, Newline, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { apiClient } from '../../services/api.js';

export const createAgentCommand = async (args: string[], context: any): Promise<React.ReactNode> => {
    return <CreateAgentForm setChatAgent={context.setChatAgent} onFinish={context.onFinish} />;
};

const CreateAgentForm = ({ setChatAgent, onFinish }: { setChatAgent: any, onFinish: (node?: React.ReactNode) => void }) => {
    const [step, setStep] = useState(0); // 0: Name, 1: Persona, 2: AgentType, 3: Creating, 4: Success, 5: Error
    const [name, setName] = useState('');
    const [persona, setPersona] = useState('');
    const [agentType, setAgentType] = useState<'operational_agent' | 'financial_agent'>('operational_agent');
    const [error, setError] = useState<string | null>(null);
    const [createdId, setCreatedId] = useState<string | null>(null);

    const handleSubmit = async () => {
        setStep(3);
        try {
            const res = await apiClient.post('/terminal/ops/agents', {
                name,
                persona,
                agentType
            });
            if (res.data.success) {
                setCreatedId(res.data.id);
                setChatAgent({ id: res.data.id, name: res.data.name });
                setStep(4);
            } else {
                setError('Failed to create agent');
                setStep(5);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
            setStep(5);
        }
    };

    if (step === 0) {
        return (
            <Box flexDirection="column">
                <Text color="cyan" bold underline>Create New AI Agent</Text>
                <Newline />
                <Box>
                    <Text bold>Agent Name: </Text>
                    <TextInput
                        value={name}
                        onChange={setName}
                        onSubmit={() => name.length > 2 && setStep(1)}
                    />
                </Box>
                <Text color="gray">(Min 3 characters)</Text>
            </Box>
        );
    }

    if (step === 1) {
        return (
            <Box flexDirection="column">
                <Text color="cyan" bold underline>Create New AI Agent</Text>
                <Newline />
                <Text bold>Agent Name: <Text color="green">{name}</Text></Text>
                <Box>
                    <Text bold>Agent Persona (Summary): </Text>
                    <TextInput
                        value={persona}
                        onChange={setPersona}
                        onSubmit={() => persona.length > 5 && setStep(2)}
                    />
                </Box>
                <Text color="gray">(Be descriptive! Min 6 characters)</Text>
            </Box>
        );
    }

    if (step === 2) {
        return (
            <Box flexDirection="column">
                <Text color="cyan" bold underline>Create New AI Agent</Text>
                <Newline />
                <Text bold>Agent Name: <Text color="green">{name}</Text></Text>
                <Text bold>Persona: <Text color="green">{persona}</Text></Text>
                <Newline />
                <Text bold>Select Agent Type (Press Space to toggle, Enter to submit):</Text>
                <Box>
                    <Text color={agentType === 'operational_agent' ? 'cyan' : 'white'}>
                        {agentType === 'operational_agent' ? '◉' : '◯'} Operational Agent (Default)
                    </Text>
                </Box>
                <Box>
                    <Text color={agentType === 'financial_agent' ? 'cyan' : 'white'}>
                        {agentType === 'financial_agent' ? '◉' : '◯'} Financial Agent (Blockchain capability)
                    </Text>
                </Box>
                <CreationController
                    onToggle={() => setAgentType(prev => prev === 'operational_agent' ? 'financial_agent' : 'operational_agent')}
                    onSubmit={handleSubmit}
                />
            </Box>
        );
    }

    if (step === 3) return <Text color="yellow">Creating agent and generating character artifacts... Please wait.</Text>;

    if (step === 4) return (
        <Box flexDirection="column">
            <Text color="green" bold>✔ Success! Agent "{name}" created successfully.</Text>
            <Text color="gray">ID: {createdId}</Text>
            <Newline />
            <Text>I have automatically set this as your active agent.</Text>
            <Text>Just type your message below to start chatting!</Text>
            <Finalizer onFinish={() => onFinish(<Text color="green">Agent {name} created and selected.</Text>)} />
        </Box>
    );

    if (step === 5) return (
        <Box flexDirection="column">
            <Text color="red" bold>Error: {error}</Text>
            <Text color="gray">Press Enter to return.</Text>
            <Finalizer onFinish={() => onFinish(<Text color="red">Creation failed: {error}</Text>)} />
        </Box>
    );

    return (
        <Box>
            <CancelController onCancel={() => onFinish(<Text color="yellow">Creation cancelled.</Text>)} />
        </Box>
    );
};

const Finalizer = ({ onFinish }: { onFinish: () => void }) => {
    useInput((input, key) => {
        if (key.return) onFinish();
    });
    return null;
};

const CancelController = ({ onCancel }: { onCancel: () => void }) => {
    useInput((input, key) => {
        if (key.escape) onCancel();
    });
    return null;
};

const CreationController = ({ onToggle, onSubmit }: { onToggle: () => void, onSubmit: () => void }) => {
    useInput((input, key) => {
        if (input === ' ') onToggle();
        if (key.return) onSubmit();
    });
    return null;
};
