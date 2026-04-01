'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/overlays/dialog';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { Textarea } from '@/components/ui/forms/textarea';
import { Label } from '@/components/ui/forms/label';
import { Cpu, Wand2, Loader2, Check, ChevronRight, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { agentApi } from '@/api/agent-api';
import { useToast } from '@/components/ui/notifications/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/selection/select';

interface CreateAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (agentId: string) => void;
}

const CHAINS = [
    { id: 'ckb-testnet',  label: 'Nervos CKB',  sub: 'Testnet'  },
    { id: 'ckb-mainnet',  label: 'Nervos CKB',  sub: 'Mainnet'  },
    { id: 'ethereum',     label: 'Ethereum',     sub: 'Managed'  },
    { id: 'polygon',      label: 'Polygon',      sub: 'Managed'  },
    { id: 'bsc',          label: 'BNB Chain',    sub: 'Managed'  },
];

export default function CreateAgentModal({ isOpen, onClose, onComplete }: CreateAgentModalProps) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [persona, setPersona] = useState('');
    const [agentType, setAgentType] = useState('operational_agent');
    const [selectedChains, setSelectedChains] = useState<string[]>(['ckb-testnet']);
    const [chainDropOpen, setChainDropOpen] = useState(false);
    const [enhancedData, setEnhancedData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const chainDropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (chainDropRef.current && !chainDropRef.current.contains(e.target as Node)) {
                setChainDropOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const router = useRouter();
    const { toast } = useToast();

    const toggleChain = (id: string) => {
        setSelectedChains(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const reset = () => {
        setStep(1); setName(''); setPersona('');
        setAgentType('operational_agent'); setSelectedChains(['ckb-testnet']);
        setEnhancedData(null);
    };

    const handleNext = async () => {
        if (!name.trim() || !persona.trim()) {
            toast({ title: 'Missing fields', description: 'Provide both a name and a persona.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            const data = await agentApi.enhancePersona(name, persona, agentType, selectedChains);
            setEnhancedData(data);
            setStep(2);
        } catch (err: any) {
            toast({ title: 'Expansion failed', description: err.message || 'AI failed to expand persona.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async () => {
        setIsLoading(true);
        try {
            const agent = await agentApi.saveAgent(
                name, undefined, persona, undefined, true,
                enhancedData, agentType, selectedChains
            );
            toast({ title: 'Agent created', description: `${name} is ready in the sandbox.` });
            if (onComplete) onComplete(agent._id);
            onClose();
            reset();
            router.push(`/sandbox?agentId=${agent._id}`);
        } catch (err: any) {
            toast({ title: 'Creation failed', description: err.message || 'Something went wrong.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); reset(); } }}>
            <DialogContent className="sm:max-w-[540px] max-h-[90vh] flex flex-col bg-card border-border/60 shadow-xl p-0 overflow-hidden gap-0">
                <div className="h-px w-full bg-gradient-to-r from-primary/70 to-primary/10" />

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-border/50">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
                                <Cpu className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-base font-bold leading-snug">
                                    {step === 1 ? 'Create AI Agent' : 'Review Persona'}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground leading-snug mt-0">
                                    {step === 1
                                        ? 'Name your agent and describe its persona — AI expands the rest.'
                                        : 'Review the AI-generated character before finalizing.'}
                                </DialogDescription>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {[1, 2].map((s) => (
                                    <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-6 bg-primary' : s < step ? 'w-3 bg-primary/40' : 'w-3 bg-border'}`} />
                                ))}
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {step === 1 ? (
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Agent Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Satoshi, Trading Bot, Fiber Guide"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-10 rounded-xl bg-background border-border/60 focus-visible:ring-primary/30 text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="persona" className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Persona Summary</Label>
                                <Textarea
                                    id="persona"
                                    placeholder="e.g. A helpful assistant specialized in CKB transactions and Fiber network payments."
                                    value={persona}
                                    onChange={(e) => setPersona(e.target.value)}
                                    className="min-h-[88px] rounded-xl bg-background border-border/60 focus-visible:ring-primary/30 text-sm resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Agent Class</Label>
                                <Select value={agentType} onValueChange={setAgentType}>
                                    <SelectTrigger className="h-10 rounded-xl bg-background border-border/60 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="operational_agent">Operational — Workflows & Default</SelectItem>
                                        <SelectItem value="financial_agent">Financial — High Security & Balances</SelectItem>
                                        <SelectItem value="social_agent">Social — Community & Platforms</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Multi-chain dropdown */}
                            <div className="space-y-1.5" ref={chainDropRef}>
                                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Blockchain Networks
                                </Label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setChainDropOpen(o => !o)}
                                        className="w-full h-10 px-3 rounded-xl border border-border/60 bg-background text-sm text-foreground flex items-center justify-between hover:border-border transition-colors"
                                    >
                                        <span className="truncate text-left">
                                            {selectedChains.length === 0
                                                ? 'Select networks…'
                                                : selectedChains.map(id => CHAINS.find(c => c.id === id)?.label).join(', ')}
                                        </span>
                                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                            {selectedChains.length > 0 && (
                                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                                                    {selectedChains.length}
                                                </span>
                                            )}
                                            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${chainDropOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>

                                    {chainDropOpen && (
                                        <div className="absolute z-50 top-full mt-1.5 w-full rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden">
                                            {CHAINS.map((chain) => {
                                                const active = selectedChains.includes(chain.id);
                                                return (
                                                    <button
                                                        key={chain.id}
                                                        type="button"
                                                        onClick={() => toggleChain(chain.id)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/40 ${active ? 'bg-primary/5' : ''}`}
                                                    >
                                                        {active
                                                            ? <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                                                            : <Square className="h-4 w-4 text-muted-foreground shrink-0" />}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-foreground">{chain.label}</div>
                                                            <div className="text-[11px] text-muted-foreground">{chain.sub}</div>
                                                        </div>
                                                        {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-muted-foreground/70">
                                    A managed wallet is provisioned per network. The agent will only transact on selected chains.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">AI-Expanded Bio</p>
                                <p className="text-sm leading-relaxed text-foreground/90">"{enhancedData?.bio}"</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Instructions</p>
                                <div className="space-y-1.5">
                                    {enhancedData?.instructions?.map((inst: string, idx: number) => (
                                        <div key={idx} className="flex gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/40 text-xs">
                                            <div className="w-1 h-1 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                                            <span className="text-foreground/80 leading-relaxed">{inst}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Personality', items: enhancedData?.traits?.personality, color: 'bg-primary/8 text-primary border-primary/15' },
                                    { label: 'Knowledge', items: enhancedData?.traits?.knowledge, color: 'bg-emerald-500/8 text-emerald-600 border-emerald-500/15' },
                                ].map(({ label, items, color }) => (
                                    <div key={label} className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {items?.map((t: string, i: number) => (
                                                <span key={i} className={`px-2 py-0.5 text-[10px] font-medium border rounded-md capitalize ${color}`}>{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Selected chains summary */}
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Wallets to provision</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedChains.map(id => {
                                        const chain = CHAINS.find(c => c.id === id);
                                        return (
                                            <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold bg-primary/8 text-primary border border-primary/15 rounded-lg">
                                                <Check className="h-2.5 w-2.5" />
                                                {chain?.label} ({chain?.sub})
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/50 flex items-center justify-end gap-2">
                    {step === 1 ? (
                        <>
                            <Button variant="ghost" onClick={() => { onClose(); reset(); }} className="h-9 px-4 rounded-xl text-sm">Cancel</Button>
                            <Button
                                onClick={handleNext}
                                disabled={isLoading}
                                className="h-9 px-5 rounded-xl text-sm bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                            >
                                {isLoading
                                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Expanding…</>
                                    : <><Wand2 className="h-3.5 w-3.5 mr-1.5" />Expand Persona<ChevronRight className="h-3.5 w-3.5 ml-0.5 opacity-60" /></>}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setStep(1)} className="h-9 px-4 rounded-xl text-sm">Back</Button>
                            <Button
                                onClick={handleCreate}
                                disabled={isLoading}
                                className="h-9 px-5 rounded-xl text-sm bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                            >
                                {isLoading
                                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Creating…</>
                                    : <><Check className="h-3.5 w-3.5 mr-1.5" />Finalize & Create</>}
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
