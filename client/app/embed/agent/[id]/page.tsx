'use client';

import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { agentApi } from '@/api/agent-api';
import { Loader2, Send } from 'lucide-react';

interface Message {
    role: 'user' | 'agent';
    content: string;
}

interface AgentInfo {
    id: string;
    name: string;
    description: string;
    agentType: string;
    character: { bio?: string; name?: string; personality?: string };
    theme: string;
    apiUrl: string;
}

export default function EmbedAgentPage({ params }: { params: Promise<{ id: string }> }) {
    const [agentId, setAgentId] = useState<string | null>(null);
    const [agent, setAgent] = useState<AgentInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sessionId = useRef<string>('');

    useEffect(() => {
        params.then(({ id }) => {
            setAgentId(id);
            sessionId.current = `embed_${id}_${Date.now()}`;
        });
    }, [params]);

    useEffect(() => {
        if (!agentId) return;
        agentApi
            .getEmbedAgent(agentId)
            .then((data: AgentInfo) => {
                setAgent(data);
                setMessages([
                    {
                        role: 'agent',
                        content: `Hi! I'm ${data.name}. ${data.character?.bio?.split('.')[0] || 'How can I help you today?'}`,
                    },
                ]);
            })
            .catch(() => setError('This agent embed is not available.'));
    }, [agentId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const prompt = input.trim();
        if (!prompt || isSending || !agent) return;

        setInput('');
        setMessages((prev) => [...prev, { role: 'user', content: prompt }]);
        setIsSending(true);

        const agentMsgIndex = messages.length + 1;
        setMessages((prev) => [...prev, { role: 'agent', content: '' }]);

        try {
            const apiUrl = `${agent.apiUrl}/agent/query`;
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    agentId: agentId,
                    sessionId: sessionId.current,
                }),
            });

            if (!res.body) throw new Error('No response body');

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;
                    try {
                        const data = JSON.parse(line.slice(5).trim());
                        const token = data.token ?? data.content ?? data.text ?? '';
                        if (token) {
                            setMessages((prev) => {
                                const next = [...prev];
                                next[agentMsgIndex] = {
                                    ...next[agentMsgIndex],
                                    content: next[agentMsgIndex].content + token,
                                };
                                return next;
                            });
                        }
                    } catch {
                        // ignore parse errors in SSE stream
                    }
                }
            }
        } catch {
            setMessages((prev) => {
                const next = [...prev];
                next[agentMsgIndex] = {
                    role: 'agent',
                    content: 'Sorry, something went wrong. Please try again.',
                };
                return next;
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as FormEvent);
        }
    };

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-400 text-sm p-8 text-center">
                {error}
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                    {agent.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{agent.name}</p>
                    <p className="text-xs text-zinc-400 truncate">
                        {agent.character?.bio?.substring(0, 60) ||
                            agent.description?.substring(0, 60) ||
                            'AI Agent'}
                        {((agent.character?.bio || agent.description)?.length ?? 0) > 60 ? '…' : ''}
                    </p>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-br-sm'
                                    : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                            }`}
                        >
                            {msg.content || (
                                <span className="flex items-center gap-1.5 text-zinc-400 italic text-xs">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Thinking…
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 p-3 bg-zinc-900 border-t border-zinc-800 flex-shrink-0"
            >
                <textarea
                    className="flex-1 resize-none bg-zinc-800 text-zinc-100 border border-zinc-700 focus:border-purple-500 rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500 max-h-28 leading-relaxed"
                    placeholder={`Message ${agent.name}…`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isSending}
                />
                <button
                    type="submit"
                    disabled={isSending || !input.trim()}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                    {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                    ) : (
                        <Send className="h-4 w-4 text-white" />
                    )}
                </button>
            </form>
        </div>
    );
}
