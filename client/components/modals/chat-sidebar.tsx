'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter
} from '@/components/ui/overlays/sheet';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/data-display/avatar';
import { Send, Loader2, User, Bot, Sparkles } from 'lucide-react';
import { useAgentManager } from '@/hooks';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    agentId: string | null;
}

export default function ChatSidebar({ isOpen, onClose, agentId }: ChatSidebarProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [agent, setAgent] = useState<any>(null);
    const { loadAgentById, chatWithAgentStream } = useAgentManager();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && agentId) {
            loadAgentById(agentId).then(data => {
                setAgent(data);
                if (messages.length === 0) {
                    const greeting = data?.character?.bio
                        ? `Hello! I'm ${data.name}. ${data.character.bio}`
                        : `Hello! I'm ${data?.name || 'your assistant'}. How can I help you today?`;

                    setMessages([{
                        role: 'assistant',
                        content: greeting,
                        timestamp: new Date()
                    }]);
                }
            });
        }
    }, [isOpen, agentId, loadAgentById, messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async () => {
        if (!input.trim() || isTyping || !agent) return;

        const userMsg: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Construct system prompt from character instructions
            const instructions = agent.character?.instructions?.join('\n') || '';
            const personality = agent.character?.traits?.personality?.join(', ') || '';

            const systemPrompt = `
                You are ${agent.name}.
                Description: ${agent.description || ''}
                Bio: ${agent.character?.bio || ''}
                Personality: ${personality}
                Instructions: ${instructions}
                Always stay in character. If tools are mentioned, act as if you can coordinate them.
            `.trim();

            const reader = await chatWithAgentStream(
                agent.modelProvider || 'ollama',
                agent.modelConfig?.modelName || 'qwen2.5:3b',
                [
                    { role: 'system', content: systemPrompt },
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                    { role: 'user', content: input }
                ],
                undefined, // apiKey handled by localStorage in hook
                agentId || undefined
            );

            if (!reader) {
                throw new Error('Failed to open stream reader');
            }

            // Create a placeholder message for the assistant
            const assistantMsgId = Date.now();
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '',
                timestamp: new Date()
            }]);

            const decoder = new TextDecoder();
            let accumulatedContent = '';
            let buffer = '';

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    // SSE events are separated by double newlines
                    const events = buffer.split('\n\n');
                    // Keep the last partial event in the buffer
                    buffer = events.pop() || '';

                    for (const event of events) {
                        if (event.startsWith('data: ')) {
                            try {
                                const json = JSON.parse(event.substring(6));
                                if (json.content) {
                                    accumulatedContent += json.content;

                                    // Try to parse the accumulated content as JSON to extract a clean message
                                    let displayMessage = accumulatedContent;
                                    try {
                                        // Robust extraction: find the first { and last }
                                        const match = accumulatedContent.match(/\{[\s\S]*\}/);
                                        if (match) {
                                            const parsed = JSON.parse(match[0]);
                                            if (parsed.message) displayMessage = parsed.message;
                                        }
                                    } catch (e) {
                                        // Not yet complete JSON or invalid, keep raw
                                    }

                                    setMessages(prev => {
                                        const next = [...prev];
                                        const last = next[next.length - 1];
                                        if (last && last.role === 'assistant') {
                                            last.content = displayMessage;
                                        }
                                        return next;
                                    });
                                }
                            } catch (e) {
                                console.warn('Failed to parse SSE event:', event);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } catch (error) {
            console.error('Chat failed:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col bg-zinc-950/95 backdrop-blur-xl border-zinc-800 text-zinc-100">
                <SheetHeader className="p-6 border-b border-zinc-800/50">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-purple-500/30">
                                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                                    {agent?.name?.charAt(0) || 'A'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-zinc-950 rounded-full" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
                                {agent?.name || 'Agent Chat'}
                                <Sparkles className="h-4 w-4 text-purple-400" />
                            </SheetTitle>
                            <SheetDescription className="text-zinc-500 text-xs">
                                {agent?.isDraft ? 'Draft Agent' : 'Published Agent'} • Powered by {agent?.modelProvider || 'Ollama'}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                        <div className="space-y-6">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className={msg.role === 'user' ? 'bg-zinc-800' : 'bg-purple-600'}>
                                                {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className={`
                                            p-3 rounded-2xl text-sm leading-relaxed
                                            ${msg.role === 'user'
                                                ? 'bg-purple-600 text-white rounded-tr-none'
                                                : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'}
                                        `}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <Avatar className="h-8 w-8 shrink-0">
                                            <AvatarFallback className="bg-purple-600">
                                                <Bot className="h-4 w-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none">
                                            <div className="flex gap-1">
                                                <span className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce" />
                                                <span className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                <span className="h-1.5 w-1.5 bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                <SheetFooter className="p-6 pt-2 border-t border-zinc-800/50 bg-zinc-950/50">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="flex gap-2 w-full"
                    >
                        <Input
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 focus-visible:ring-purple-500 h-11"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isTyping || !input.trim()}
                            className="h-11 w-11 shrink-0 bg-purple-600 hover:bg-purple-500"
                        >
                            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
