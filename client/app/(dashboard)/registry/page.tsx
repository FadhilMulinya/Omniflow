'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { registryApi } from '@/api/registry-api';
import { agentControlApi } from '@/api/fiber-api';
import { Button } from '@/components/ui/buttons/button';
import {
    IconSearch, IconGlobe, IconBolt, IconChevronRight, IconPlayerPlay,
    IconSquare, IconKey, IconPlus, IconCopy, IconCheck,
} from '@tabler/icons-react';
import { toast } from '@/components/ui';
import RegisterAgentModal from './components/RegisterAgentModal';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

function NetworkBadges({ networks }: { networks: any[] }) {
    return (
        <div className="flex flex-wrap gap-1 mt-2">
            {(networks || []).map((n: any) => (
                <span key={n.network} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                    {n.network}
                </span>
            ))}
        </div>
    );
}

function PeerIdRow({ networks }: { networks: any[] }) {
    const ckbNets = (networks || []).filter((n: any) => n.network === 'CKB' && n.fiberPeerId);
    if (!ckbNets.length) return null;
    return (
        <div className="mt-2 space-y-1">
            {ckbNets.map((n: any, i: number) => (
                <PeerIdCopy key={i} peerId={n.fiberPeerId} />
            ))}
        </div>
    );
}

function PeerIdCopy({ peerId }: { peerId: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="flex items-center gap-1.5 bg-muted/30 rounded-lg px-2 py-1.5 border border-border/40">
            <IconKey className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">{peerId}</span>
            <button onClick={copy} className="shrink-0 text-muted-foreground hover:text-primary transition-colors" title="Copy Peer ID">
                {copied ? <IconCheck className="w-3 h-3 text-emerald-500" /> : <IconCopy className="w-3 h-3" />}
            </button>
        </div>
    );
}

function AgentCard({ card, onControl }: { card: any; onControl: (id: string, cmd: 'start' | 'stop') => void }) {
    const isActive = card.status === 'active';
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/30 transition-colors group"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                        <h3 className="font-semibold text-sm truncate">{card.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{card.description || 'No description'}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {(card.capabilities || []).map((c: string) => (
                            <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{c}</span>
                        ))}
                    </div>
                    <NetworkBadges networks={card.networks || []} />
                    <PeerIdRow networks={card.networks || []} />
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        onClick={() => onControl(card.agentId, isActive ? 'stop' : 'start')}>
                        {isActive
                            ? <IconSquare className="w-3.5 h-3.5 text-destructive" />
                            : <IconPlayerPlay className="w-3.5 h-3.5 text-emerald-500" />}
                    </Button>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">v{card.version || '1.0.0'}</span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            </div>
        </motion.div>
    );
}

export default function RegistryPage() {
    const [search, setSearch] = useState('');
    const [networkFilter, setNetworkFilter] = useState('');
    const [showRegister, setShowRegister] = useState(false);
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['registry', search, networkFilter],
        queryFn: () => registryApi.list({ name: search || undefined, network: networkFilter || undefined }),
    });

    const controlMutation = useMutation({
        mutationFn: ({ id, cmd, reason }: { id: string; cmd: 'start' | 'stop'; reason?: string }) =>
            cmd === 'start' ? agentControlApi.start(id, reason) : agentControlApi.stop(id, reason),
        onSuccess: (_, vars) => {
            toast({ title: `Agent ${vars.cmd === 'start' ? 'started' : 'stopped'}` });
            qc.invalidateQueries({ queryKey: ['registry'] });
        },
        onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
    });

    const agents: any[] = data?.agents || [];

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Agent Registry</h1>
                    <p className="text-sm text-muted-foreground mt-1">Discover and interact with published agents across all networks</p>
                </div>
                <Button onClick={() => setShowRegister(true)} className="gap-2">
                    <IconPlus className="w-4 h-4" /> Register Agent
                </Button>
            </div>

            <div className="flex gap-3">
                <div className="relative flex-1">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <input value={networkFilter} onChange={e => setNetworkFilter(e.target.value)} placeholder="Filter by network..."
                    className="px-4 py-2.5 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-48" />
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-44 rounded-2xl bg-muted/30 animate-pulse" />
                    ))}
                </div>
            ) : agents.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <IconGlobe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No agents found. Register your first agent.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((card: any) => (
                        <AgentCard key={card._id} card={card}
                            onControl={(id, cmd) => controlMutation.mutate({ id, cmd })} />
                    ))}
                </div>
            )}

            {showRegister && <RegisterAgentModal onClose={() => setShowRegister(false)} onSuccess={() => { setShowRegister(false); qc.invalidateQueries({ queryKey: ['registry'] }); }} />}
        </div>
    );
}
