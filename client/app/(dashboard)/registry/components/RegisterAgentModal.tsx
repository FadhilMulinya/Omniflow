'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { registryApi, AgentNetwork } from '@/api/registry-api';
import { apiFetch } from '@/api/api-client';
import { Button } from '@/components/ui/buttons/button';
import { toast } from '@/components/ui';
import {
    IconX, IconPlus, IconTrash, IconCopy, IconCheck, IconGlobe, IconPencil,
} from '@tabler/icons-react';
import { MarketplaceSection } from './MarketplaceSection';

const NETWORKS = ['CKB', 'Ethereum', 'Solana', 'Polygon', 'BNB Chain'];
const CHAIN_TYPES: Record<string, AgentNetwork['chainType']> = {
    CKB: 'ckb', Ethereum: 'evm', Solana: 'solana', Polygon: 'evm', 'BNB Chain': 'evm',
};
const TYPE_CAPABILITIES: Record<string, string[]> = {
    financial_agent:    ['payment-channel', 'defi', 'portfolio-management', 'trading'],
    social_agent:       ['messaging', 'social', 'content-creation', 'community'],
    operational_agent:  ['data-processing', 'automation', 'workflow', 'monitoring'],
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

const emptyNetwork = (): AgentNetwork => ({
    network: 'CKB', chainType: 'ckb', walletAddress: '',
    fiberNodeType: 'managed', isPaymentEnabled: false,
});

export default function RegisterAgentModal({ onClose, onSuccess }: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [agents, setAgents]           = useState<any[]>([]);
    const [agentId, setAgentId]         = useState('');
    const [capabilities, setCapabilities] = useState<string[]>([]);
    const [capInput, setCapInput]       = useState('');
    const [endpoint, setEndpoint]       = useState('');
    const [isPublic, setIsPublic]       = useState(true);
    const [networks, setNetworks]       = useState<AgentNetwork[]>([emptyNetwork()]);
    const [rawKey, setRawKey]           = useState('');
    const [copied, setCopied]           = useState(false);

    // Load published agents only
    useEffect(() => {
        apiFetch('/agents').then((data: any) => {
            const list = Array.isArray(data) ? data : data?.agents || [];
            setAgents(list.filter((a: any) => !a.isDraft));
        }).catch(() => {});
    }, []);

    // When agent selected: auto-fill capabilities + peer IDs from agent's blockchain data
    useEffect(() => {
        if (!agentId) return;
        const agent = agents.find(a => a._id === agentId);
        if (!agent) return;

        // Auto-generate endpoint
        setEndpoint(`${API_BASE}/api/registry/well-known/${agentId}`);

        // Pre-populate networks from agent's blockchain wallets, injecting peer IDs where available
        const agentBlockchains: any[] = agent.blockchain || [];
        if (agentBlockchains.length > 0) {
            const prefilled = agentBlockchains.map((bc: any) => ({
                network: bc.network || 'CKB',
                chainType: CHAIN_TYPES[bc.network] || 'ckb',
                walletAddress: bc.walletAddress || '',
                fiberNodeType: 'managed' as const,
                isPaymentEnabled: false,
                // Auto-fill discovered peer ID from agent's CKB network config
                fiberPeerId: bc.peerId || bc.peer_id || '',
                fiberNodeUrl: bc.rpcUrl || '',
            }));
            setNetworks(prefilled);
        }

        // Try to load existing AgentCard capabilities first
        registryApi.get(agentId).then((card: any) => {
            if (card?.capabilities?.length) setCapabilities(card.capabilities);
            else setCapabilities(TYPE_CAPABILITIES[agent.agentType] || []);
            // If the card already has networks with peer IDs, prefer those
            if (card?.networks?.length) setNetworks(card.networks);
        }).catch(() => {
            setCapabilities(TYPE_CAPABILITIES[agent.agentType] || []);
        });
    }, [agentId, agents]);

    const addCapability = () => {
        const trimmed = capInput.trim();
        if (!trimmed || capabilities.includes(trimmed)) return;
        setCapabilities(prev => [...prev, trimmed]);
        setCapInput('');
    };

    const removeCapability = (cap: string) => setCapabilities(prev => prev.filter(c => c !== cap));

    const updateNetwork = (i: number, field: keyof AgentNetwork, value: any) => {
        setNetworks(prev => prev.map((n, idx) => {
            if (idx !== i) return n;
            const updated = { ...n, [field]: value };
            if (field === 'network') updated.chainType = CHAIN_TYPES[value as string] || 'other';
            return updated;
        }));
    };

    const copyKey = () => {
        navigator.clipboard.writeText(rawKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const mutation = useMutation({
        mutationFn: () => registryApi.register({
            agentId, capabilities, endpoint, networks, isPublic,
        }),
        onSuccess: (data: any) => {
            if (data.agentApiKey) setRawKey(data.agentApiKey);
            else { toast({ title: 'Updated!' }); onSuccess(); }
        },
        onError: (e: any) => toast({ title: 'Failed', description: e.message, variant: 'destructive' }),
    });

    // Key reveal screen
    if (rawKey) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md space-y-4">
                    <h2 className="text-lg font-bold">Agent API Key</h2>
                    <p className="text-sm text-muted-foreground">This key will not be shown again. Copy it now to authenticate A2A calls.</p>
                    <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-3 font-mono text-xs break-all">
                        <span className="flex-1">{rawKey}</span>
                        <button onClick={copyKey} className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
                            {copied ? <IconCheck className="w-4 h-4 text-emerald-500" /> : <IconCopy className="w-4 h-4" />}
                        </button>
                    </div>
                    {agentId && (
                        <MarketplaceSection agentId={agentId} agentName={agents.find(a => a._id === agentId)?.name || ''} onPublished={onSuccess} />
                    )}
                    <Button className="w-full" onClick={onSuccess}>Done</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg space-y-5 my-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Register Agent</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><IconX className="w-5 h-5" /></button>
                </div>

                {/* Agent selector — published only */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Published Agent</label>
                    {agents.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 bg-muted/30 rounded-xl px-3 py-2.5">No published agents found. Publish an agent from the Sandbox first.</p>
                    ) : (
                        <select value={agentId} onChange={e => setAgentId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-border/60 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">Select a published agent…</option>
                            {agents.map(a => (
                                <option key={a._id} value={a._id}>{a.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Capabilities — auto-filled, editable */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Capabilities</label>
                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-xl border border-border/60 bg-muted/20">
                        {capabilities.map(cap => (
                            <span key={cap} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {cap}
                                <button onClick={() => removeCapability(cap)} className="hover:text-destructive transition-colors"><IconX className="w-2.5 h-2.5" /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={capInput} onChange={e => setCapInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCapability(); }}}
                            placeholder="Add capability and press Enter…"
                            className="flex-1 px-3 py-1.5 rounded-xl border border-border/60 bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <Button size="sm" variant="outline" onClick={addCapability} className="h-8 gap-1">
                            <IconPlus className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                {/* Public endpoint — auto-generated */}
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                        <IconGlobe className="w-3 h-3" /> Public Discovery Endpoint
                    </label>
                    <div className="flex items-center gap-2">
                        <input value={endpoint} onChange={e => setEndpoint(e.target.value)}
                            placeholder="Auto-generated after selecting agent"
                            className="flex-1 px-3 py-2 rounded-xl border border-border/60 bg-muted/20 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        {endpoint && (
                            <button onClick={() => { navigator.clipboard.writeText(endpoint); toast({ title: 'Copied!' }); }}
                                className="p-2 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors">
                                <IconCopy className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">Other agents use this URL to discover capabilities. Make discoverable = public.</p>
                </div>

                {/* Networks */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-muted-foreground">Networks</label>
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs"
                            onClick={() => setNetworks(p => [...p, emptyNetwork()])}>
                            <IconPlus className="w-3 h-3" /> Add
                        </Button>
                    </div>
                    {networks.map((net, i) => (
                        <div key={i} className="rounded-xl border border-border/60 p-3 space-y-2 bg-muted/10">
                            <div className="flex items-center gap-2">
                                <select value={net.network} onChange={e => updateNetwork(i, 'network', e.target.value)}
                                    className="flex-1 px-2 py-1.5 rounded-lg border border-border/60 bg-card text-xs focus:outline-none">
                                    {NETWORKS.map(n => <option key={n}>{n}</option>)}
                                </select>
                                {networks.length > 1 && (
                                    <button onClick={() => setNetworks(p => p.filter((_, idx) => idx !== i))}
                                        className="text-destructive hover:opacity-70 transition-opacity"><IconTrash className="w-3.5 h-3.5" /></button>
                                )}
                            </div>
                            <input value={net.walletAddress} onChange={e => updateNetwork(i, 'walletAddress', e.target.value)}
                                placeholder="Wallet address" className="w-full px-2 py-1.5 rounded-lg border border-border/60 bg-card text-xs focus:outline-none" />
                            {net.network === 'CKB' && (
                                <>
                                    <select value={net.fiberNodeType} onChange={e => updateNetwork(i, 'fiberNodeType', e.target.value)}
                                        className="w-full px-2 py-1.5 rounded-lg border border-border/60 bg-card text-xs focus:outline-none">
                                        <option value="managed">Fiber: Managed (platform node)</option>
                                        <option value="custom">Fiber: Custom (my own node — required)</option>
                                    </select>
                                    {net.fiberNodeType === 'custom' && (
                                        <input value={net.fiberNodeUrl || ''} onChange={e => updateNetwork(i, 'fiberNodeUrl', e.target.value)}
                                            placeholder="http://your-fiber-node:8227 (required)"
                                            className="w-full px-2 py-1.5 rounded-lg border border-primary/40 bg-card text-xs focus:outline-none" required />
                                    )}
                                    <input value={net.fiberPeerId || ''} onChange={e => updateNetwork(i, 'fiberPeerId', e.target.value)}
                                        placeholder="Fiber Peer ID (optional)"
                                        className="w-full px-2 py-1.5 rounded-lg border border-border/60 bg-card text-xs focus:outline-none" />
                                </>
                            )}
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                <input type="checkbox" checked={net.isPaymentEnabled}
                                    onChange={e => updateNetwork(i, 'isPaymentEnabled', e.target.checked)} />
                                Enable payments on this network
                            </label>
                        </div>
                    ))}
                </div>

                {/* Discoverable toggle */}
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                    Make publicly discoverable in registry
                </label>

                {/* Marketplace section */}
                {agentId && (
                    <MarketplaceSection
                        agentId={agentId}
                        agentName={agents.find(a => a._id === agentId)?.name || ''}
                    />
                )}

                <Button className="w-full" onClick={() => mutation.mutate()}
                    disabled={!agentId || mutation.isPending}>
                    {mutation.isPending ? 'Registering…' : 'Register Agent'}
                </Button>
            </div>
        </div>
    );
}
