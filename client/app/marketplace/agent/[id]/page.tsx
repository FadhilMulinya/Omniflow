'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { agentApi } from '@/api/agent-api';
import { Button } from '@/components/ui/buttons/button';
import { Badge } from '@/components/ui/feedback/badge';
import { Input } from '@/components/ui/forms/input';
import { toast } from '@/components/ui';
import {
    ArrowLeft, Bot, Eye, Star, ShoppingCart, Loader2, Copy, Check, ExternalLink,
    ChevronDown, ChevronUp, Code2, ShieldCheck, ShieldX, Wallet, Layers,
} from 'lucide-react';

// ── JSON viewer ───────────────────────────────────────────────────────────────
function JsonViewer({ data, label }: { data: any; label: string }) {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const json = JSON.stringify(data, null, 2);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-zinc-800/40 transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <Code2 className="h-4 w-4 text-[#9AB17A]" />
                    <span className="text-sm font-semibold">{label}</span>
                </div>
                {open ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
            </button>

            {open && (
                <div className="border-t border-zinc-800">
                    <div className="relative">
                        <pre className="text-[11px] leading-relaxed font-mono text-[#C3CC9B] bg-zinc-950 p-4 overflow-x-auto max-h-[400px] overflow-y-auto">
                            {json}
                        </pre>
                        <button
                            onClick={handleCopy}
                            className="absolute top-3 right-3 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                            title="Copy JSON"
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-[#9AB17A]" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Constraint list ───────────────────────────────────────────────────────────
function ConstraintList({ items, allowed }: { items: string[]; allowed: boolean }) {
    if (!items?.length) return null;
    return (
        <ul className="space-y-1.5">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                    {allowed
                        ? <ShieldCheck className="h-3.5 w-3.5 text-[#9AB17A] mt-0.5 shrink-0" />
                        : <ShieldX    className="h-3.5 w-3.5 text-red-400   mt-0.5 shrink-0" />}
                    <span className="text-zinc-300 leading-snug">{item}</span>
                </li>
            ))}
        </ul>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MarketplaceAgentPage({ params }: { params: Promise<{ id: string }> }) {
    const [agentId, setAgentId]     = useState<string | null>(null);
    const [agent, setAgent]         = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Payment state
    const [buyStep, setBuyStep]         = useState<'idle' | 'choosing' | 'stripe' | 'crypto' | 'done'>('idle');
    const [txHash, setTxHash]           = useState('');
    const [isProcessing, setProcessing] = useState(false);
    const [copiedWallet, setCopiedWallet] = useState(false);

    useEffect(() => { params.then(({ id }) => setAgentId(id)); }, [params]);
    useEffect(() => {
        if (!agentId) return;
        agentApi.getMarketplaceAgent(agentId)
            .then(setAgent).catch(() => setAgent(null)).finally(() => setIsLoading(false));
    }, [agentId]);

    const mkt           = agent?.marketplace || {};
    const isFree        = mkt.pricing?.type !== 'paid';
    const stripeEnabled = mkt.paymentMethods?.stripe?.enabled;
    const cryptoEnabled = mkt.paymentMethods?.crypto?.enabled;
    const crypto        = mkt.paymentMethods?.crypto || {};
    const char          = agent?.character || {};

    // Allowed actions from character profile
    const allowedActions: string[] = [
        ...(char.financial_profile?.supported_actions || []),
        ...(char.operational_profile?.supported_tasks || []),
        ...(char.social_profile?.supported_platforms?.map((p: string) => `Platform: ${p}`) || []),
    ];
    const notAllowed: string[] = [
        ...(char.constraints?.must_not_do || []),
        ...(char.risk_controls?.forbidden_financial_actions || []),
    ];
    const safetyRules: string[] = char.constraints?.safety_rules || [];

    // Wallet addresses from blockchain config
    const blockchains: { network: string; address?: string }[] = agent?.blockchain || [];

    const handleStripeCheckout = async () => {
        if (!agentId) return;
        setProcessing(true);
        try {
            const { sessionUrl } = await agentApi.createStripeCheckout(agentId);
            window.location.href = sessionUrl;
        } catch (e: any) {
            toast({ title: 'Checkout failed', description: e.message, variant: 'destructive' });
        } finally { setProcessing(false); }
    };

    const handleCryptoSubmit = async () => {
        if (!agentId || !txHash.trim()) return;
        setProcessing(true);
        try {
            await agentApi.submitCryptoPurchase(agentId, txHash.trim(), crypto.network);
            setBuyStep('done');
            toast({ title: 'Transaction submitted', description: 'Pending on-chain verification.' });
        } catch (e: any) {
            toast({ title: 'Submission failed', description: e.message, variant: 'destructive' });
        } finally { setProcessing(false); }
    };

    const copyWallet = async () => {
        await navigator.clipboard.writeText(crypto.walletAddress || '');
        setCopiedWallet(true);
        setTimeout(() => setCopiedWallet(false), 2000);
    };

    if (isLoading) return (
        <div className="flex h-screen items-center justify-center bg-zinc-950">
            <Loader2 className="h-8 w-8 animate-spin text-[#9AB17A]" />
        </div>
    );

    if (!agent) return (
        <div className="flex flex-col h-screen items-center justify-center bg-zinc-950 gap-4">
            <p className="text-zinc-400">Agent not found or not listed on marketplace.</p>
            <Link href="/marketplace"><Button variant="outline">Back to Marketplace</Button></Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Marketplace
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* ── Main info ── */}
                    <div className="md:col-span-2 space-y-4">

                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#9AB17A]/15 flex items-center justify-center border border-[#9AB17A]/25 flex-shrink-0">
                                <Bot className="h-7 w-7 text-[#9AB17A]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{agent.name}</h1>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    {mkt.category && (
                                        <Badge className="text-xs bg-[#9AB17A]/10 text-[#9AB17A] border-[#9AB17A]/25">
                                            {mkt.category}
                                        </Badge>
                                    )}
                                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                                        <Eye className="h-3 w-3" /> {mkt.stats?.views || 0} views
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                                        <Star className="h-3 w-3" /> {(mkt.stats?.rating || 0).toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                            <h2 className="font-semibold mb-2 text-sm">About this agent</h2>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                {agent.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Character bio */}
                        {char.character?.bio && (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                                <h2 className="font-semibold mb-2 text-sm">Character</h2>
                                <p className="text-sm text-zinc-400 leading-relaxed italic">{char.character.bio}</p>
                                {char.character?.traits?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {char.character.traits.map((t: string) => (
                                            <span key={t} className="px-2 py-0.5 text-[10px] rounded-full bg-[#9AB17A]/10 text-[#9AB17A] border border-[#9AB17A]/20 font-medium">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Details grid */}
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                            <h2 className="font-semibold mb-3 text-sm">Details</h2>
                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <dt className="text-xs text-zinc-500 mb-0.5">Type</dt>
                                    <dd className="font-medium capitalize">{agent.agentType?.replace(/_/g, ' ')}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-zinc-500 mb-0.5">Model Provider</dt>
                                    <dd className="font-medium capitalize">{agent.modelProvider || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-zinc-500 mb-0.5">Purchases</dt>
                                    <dd className="font-medium">{mkt.stats?.purchases || 0}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-zinc-500 mb-0.5">Purpose</dt>
                                    <dd className="font-medium text-xs leading-snug line-clamp-2">
                                        {char.purpose?.primary_goal || '—'}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Wallet addresses */}
                        {blockchains.length > 0 && (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                                <h2 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-[#9AB17A]" /> Wallets &amp; Chains
                                </h2>
                                <div className="space-y-2">
                                    {blockchains.map((bc, i) => (
                                        <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <Layers className="h-3.5 w-3.5 text-[#C3CC9B]" />
                                                <span className="text-xs font-medium text-zinc-300">{bc.network}</span>
                                            </div>
                                            {bc.address && (
                                                <code className="text-[10px] text-zinc-500 font-mono">
                                                    {bc.address.slice(0, 8)}…{bc.address.slice(-6)}
                                                </code>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Allowed actions */}
                        {allowedActions.length > 0 && (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                                <h2 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-[#9AB17A]" /> What this agent can do
                                </h2>
                                <ConstraintList items={allowedActions} allowed={true} />
                            </div>
                        )}

                        {/* Not allowed */}
                        {notAllowed.length > 0 && (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                                <h2 className="font-semibold mb-3 text-sm flex items-center gap-2">
                                    <ShieldX className="h-4 w-4 text-red-400" /> What this agent will NOT do
                                </h2>
                                <ConstraintList items={notAllowed} allowed={false} />
                                {safetyRules.length > 0 && (
                                    <>
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mt-4 mb-2">Safety Rules</p>
                                        <ConstraintList items={safetyRules} allowed={true} />
                                    </>
                                )}
                            </div>
                        )}

                        {/* JSON viewers */}
                        {Object.keys(char).length > 0 && (
                            <JsonViewer data={char} label="Full Character JSON" />
                        )}
                        {agent.graph && (
                            <JsonViewer data={{ nodes: agent.graph.nodes?.length, edges: agent.graph.edges?.length, preview: 'Use Open in Sandbox to inspect the full graph' }} label="Workflow Graph Info" />
                        )}
                    </div>

                    {/* ── Purchase sidebar ── */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4 sticky top-6">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Price</p>
                                <p className={`text-3xl font-bold ${isFree ? 'text-[#9AB17A]' : 'text-[#FBE8CE]'}`}>
                                    {isFree ? 'Free' : `${mkt.pricing?.currency} ${mkt.pricing?.price}`}
                                </p>
                            </div>

                            {buyStep === 'idle' && (
                                <Button
                                    className="w-full bg-[#9AB17A] hover:bg-[#8aa06a] text-zinc-900 font-semibold"
                                    onClick={() => isFree ? setBuyStep('done') : setBuyStep('choosing')}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    {isFree ? 'Use Agent' : 'Buy Agent'}
                                </Button>
                            )}

                            {buyStep === 'choosing' && (
                                <div className="space-y-2">
                                    <p className="text-xs text-zinc-400 font-medium">Choose payment method</p>
                                    {stripeEnabled && (
                                        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-sm"
                                            onClick={handleStripeCheckout} disabled={isProcessing}>
                                            {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                            Pay with Card (Stripe)
                                        </Button>
                                    )}
                                    {cryptoEnabled && (
                                        <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-sm"
                                            onClick={() => setBuyStep('crypto')}>
                                            Pay with Crypto
                                        </Button>
                                    )}
                                    <Button variant="ghost" className="w-full text-xs text-zinc-500" onClick={() => setBuyStep('idle')}>
                                        Cancel
                                    </Button>
                                </div>
                            )}

                            {buyStep === 'crypto' && (
                                <div className="space-y-3">
                                    <p className="text-xs text-zinc-400 font-medium">Send payment to:</p>
                                    <div className="bg-zinc-800 rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-500">Network</span>
                                            <span className="font-medium">{crypto.network}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-500">Asset</span>
                                            <span className="font-medium">{crypto.asset}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-500">Amount</span>
                                            <span className="font-bold text-[#FBE8CE]">{crypto.amount} {crypto.asset}</span>
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-xs text-zinc-500 mb-1">Wallet address</p>
                                            <div className="relative">
                                                <code className="text-xs break-all bg-zinc-900 rounded px-2 py-1.5 block pr-8">
                                                    {crypto.walletAddress}
                                                </code>
                                                <button onClick={copyWallet} className="absolute top-1 right-1 p-1 rounded bg-zinc-700 hover:bg-zinc-600">
                                                    {copiedWallet ? <Check className="h-3 w-3 text-[#9AB17A]" /> : <Copy className="h-3 w-3" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-500">After sending, paste your transaction hash below:</p>
                                    <Input placeholder="0x..." value={txHash} onChange={(e) => setTxHash(e.target.value)}
                                        className="bg-zinc-800 border-zinc-700 text-xs font-mono" />
                                    <Button className="w-full bg-[#9AB17A] hover:bg-[#8aa06a] text-zinc-900 font-semibold text-sm"
                                        onClick={handleCryptoSubmit} disabled={!txHash.trim() || isProcessing}>
                                        {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                        Submit Transaction
                                    </Button>
                                    <Button variant="ghost" className="w-full text-xs text-zinc-500" onClick={() => setBuyStep('choosing')}>
                                        Back
                                    </Button>
                                </div>
                            )}

                            {buyStep === 'done' && (
                                <div className="text-center py-4 space-y-2">
                                    <div className="w-12 h-12 rounded-full bg-[#9AB17A]/20 flex items-center justify-center mx-auto">
                                        <Check className="h-6 w-6 text-[#9AB17A]" />
                                    </div>
                                    <p className="font-semibold text-[#9AB17A]">
                                        {isFree ? 'Ready to use!' : 'Payment submitted!'}
                                    </p>
                                    {!isFree && (
                                        <p className="text-xs text-zinc-500">
                                            We'll verify your payment and grant access shortly.
                                        </p>
                                    )}
                                </div>
                            )}

                            <Link href={`/sandbox?agentId=${agent._id}`}
                                className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                                <ExternalLink className="h-3 w-3" /> Open in Sandbox
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
