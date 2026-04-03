'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { agentApi } from '@/api/agent-api';
import { Button } from '@/components/ui/buttons/button';
import { Badge } from '@/components/ui/feedback/badge';
import { toast } from '@/components/ui';
import { CreditCard, CheckCircle2, ExternalLink, Loader2, ShoppingBag, AlertCircle } from 'lucide-react';

function PaymentSettingsContent() {
    const searchParams = useSearchParams();
    const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; stripeAccountId: string | null } | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);
    const [myPurchases, setMyPurchases] = useState<any[]>([]);
    const [isLoadingPurchases, setIsLoadingPurchases] = useState(true);

    useEffect(() => {
        if (searchParams.get('stripe') === 'connected') {
            toast({ title: 'Stripe account connected!', description: 'You can now receive payments on the marketplace.' });
        }
    }, [searchParams]);

    useEffect(() => {
        agentApi.getStripeStatus()
            .then(setStripeStatus)
            .catch(() => setStripeStatus({ connected: false, stripeAccountId: null }))
            .finally(() => setIsLoadingStatus(false));

        agentApi.getMyPurchases()
            .then(setMyPurchases)
            .catch(() => setMyPurchases([]))
            .finally(() => setIsLoadingPurchases(false));
    }, []);

    const handleConnectStripe = async () => {
        setIsConnecting(true);
        try {
            const { url } = await agentApi.getStripeConnectUrl();
            window.location.href = url;
        } catch (e: any) {
            toast({ title: 'Failed to get Stripe URL', description: e.message, variant: 'destructive' });
            setIsConnecting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                    Payment Settings
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Connect payment methods to sell your agents on the marketplace.
                </p>
            </div>

            {/* Stripe Connect */}
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                        <CreditCard className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Stripe Connect</h2>
                        <p className="text-xs text-muted-foreground">Accept card payments from buyers worldwide</p>
                    </div>
                    {!isLoadingStatus && (
                        <div className="ml-auto">
                            {stripeStatus?.connected ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                                </Badge>
                            ) : (
                                <Badge className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">
                                    <AlertCircle className="h-3 w-3 mr-1" /> Not connected
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {isLoadingStatus ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Checking status…
                    </div>
                ) : stripeStatus?.connected ? (
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-sm text-emerald-400">
                        <p className="font-medium">Your Stripe account is connected.</p>
                        <p className="text-xs mt-0.5 text-emerald-400/70">
                            Account ID: <code>{stripeStatus.stripeAccountId}</code>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Connect your Stripe account to receive payments when buyers purchase your agents.
                        </p>
                        <Button onClick={handleConnectStripe} disabled={isConnecting}
                            className="bg-[#635bff] hover:bg-[#5851e0] text-white">
                            {isConnecting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <ExternalLink className="h-4 w-4 mr-2" />
                            )}
                            Connect with Stripe
                        </Button>
                    </div>
                )}
            </div>

            {/* Crypto info */}
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <span className="text-lg">₿</span>
                    </div>
                    <div>
                        <h2 className="font-semibold">Crypto Payments</h2>
                        <p className="text-xs text-muted-foreground">Accept crypto directly to your wallet</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground">
                    Configure your wallet address when you publish an agent to the marketplace.
                    Go to <strong>Sandbox → Export → Marketplace</strong> on any agent to set up crypto payment details.
                </p>
            </div>

            {/* Purchase history */}
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Purchase History</h2>
                </div>

                {isLoadingPurchases ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </div>
                ) : myPurchases.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        You haven't purchased any agents yet.{' '}
                        <a href="/marketplace" className="text-primary hover:underline">Browse the marketplace</a>.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {myPurchases.map((p: any) => (
                            <div key={p._id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium">{p.agentId?.name || 'Unknown Agent'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {p.paymentMethod === 'stripe' ? 'Card' : 'Crypto'} · {new Date(p.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-primary">
                                        {p.currency} {p.amount}
                                    </span>
                                    <Badge className={
                                        p.status === 'confirmed'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : p.status === 'failed'
                                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }>
                                        {p.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function PaymentSettingsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <PaymentSettingsContent />
        </Suspense>
    );
}
