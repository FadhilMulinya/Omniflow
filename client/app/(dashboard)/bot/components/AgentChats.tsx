'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api-client';
import { a2aApi } from '@/api/a2a-api';
import { MessageSquare, ArrowRight, ArrowLeft, ChevronDown, Inbox, AlertCircle, ExternalLink } from 'lucide-react';

const PERF_COLOR: Record<string, string> = {
    request:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
    inform:       'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    confirm:      'bg-green-500/10 text-green-400 border-green-500/20',
    refuse:       'bg-red-500/10 text-red-400 border-red-500/20',
    query:        'bg-violet-500/10 text-violet-400 border-violet-500/20',
    propose:      'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'open-channel':'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

function PerformativeBadge({ p }: { p: string }) {
    return (
        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${PERF_COLOR[p] || 'bg-muted/60 text-muted-foreground border-border/40'}`}>
            {p}
        </span>
    );
}

function MessageRow({ msg, agentId }: { msg: any; agentId: string }) {
    const isSent = String(msg.senderId) === agentId;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isSent ? 'bg-primary/10' : 'bg-muted/60'}`}>
                {isSent ? <ArrowRight className="w-3 h-3 text-primary" /> : <ArrowLeft className="w-3 h-3 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <PerformativeBadge p={msg.performative} />
                    <span className="text-[10px] text-muted-foreground">{isSent ? 'sent' : 'received'}</span>
                    <span className="text-[10px] text-muted-foreground/50 ml-auto">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className="text-xs text-foreground/80 bg-muted/30 rounded-lg px-3 py-2 font-mono break-all">
                    {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content, null, 2)}
                </div>
                <div className="text-[9px] text-muted-foreground/50 mt-1">conv: {msg.conversationId?.slice(0, 12)}…</div>
            </div>
        </div>
    );
}

export function AgentChats() {
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string>('');
    const [messages, setMessages] = useState<any[]>([]);
    const [total, setTotal]         = useState(0);
    const [loadingAgents, setLoadingAgents] = useState(true);
    const [loadingMsgs, setLoadingMsgs]     = useState(false);

    useEffect(() => {
        apiFetch('/agents').then((data: any) => {
            const list = Array.isArray(data) ? data : data?.agents || [];
            setAgents(list);
            if (list.length > 0) setSelectedId(list[0]._id);
        }).finally(() => setLoadingAgents(false));
    }, []);

    useEffect(() => {
        if (!selectedId) return;
        setLoadingMsgs(true);
        Promise.all([
            a2aApi.inbox(selectedId, { limit: 50 }),
            // also fetch sent (messages where senderId = selectedId)
        ]).then(([inboxData]) => {
            setMessages(inboxData?.messages || []);
            setTotal(inboxData?.total || 0);
        }).catch(() => {}).finally(() => setLoadingMsgs(false));
    }, [selectedId]);

    if (loadingAgents) return <div className="flex-1 flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;

    if (agents.length === 0) return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-16">
            <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No agents yet. Create and publish an agent first.</p>
        </div>
    );

    const selected = agents.find(a => a._id === selectedId);

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-4">
            {/* Agent selector */}
            <div className="flex-shrink-0">
                <div className="relative">
                    <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                        className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        {agents.map(a => (
                            <option key={a._id} value={a._id}>{a.name} {a.isDraft ? '(draft)' : ''}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
                {selected && (
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${selected.status === 'running' ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                        <span className="text-xs text-muted-foreground">
                            {selected.status === 'running' ? 'Running' : 'Stopped'} · {total} message{total !== 1 ? 's' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Interaction gate — agent must be running */}
            {selected && selected.status !== 'running' && (
                <div className="flex-shrink-0 flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-400/30 bg-amber-500/5">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-600">Agent is not running</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            Start the simulation from the{' '}
                            <a href="/sandbox" className="underline text-primary inline-flex items-center gap-0.5">
                                Sandbox <ExternalLink className="w-2.5 h-2.5" />
                            </a>{' '}
                            to enable live A2A messaging for this agent.
                        </p>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-0 rounded-xl border border-border/60 bg-card p-4">
                {loadingMsgs ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
                        <Inbox className="w-8 h-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No messages yet for this agent.</p>
                        <p className="text-xs text-muted-foreground/60">Messages from other agents will appear here.</p>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
                        {messages.map(msg => <MessageRow key={msg._id} msg={msg} agentId={selectedId} />)}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
