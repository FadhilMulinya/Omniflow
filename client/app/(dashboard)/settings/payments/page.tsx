'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { agentApi } from '@/api/agent-api';
import { Button } from '@/components/ui/buttons/button';
import { Badge } from '@/components/ui/feedback/badge';
import { toast } from '@/components/ui';
import { CreditCard, CheckCircle2, ExternalLink, Loader2, ShoppingBag, AlertCircle } from 'lucide-react';

function PaymentSettingsContent() {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                    Billing & Payments
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage your crypto payment methods and view your transaction history.
                </p>
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
                    Connect your wallet to receive payments directly.
                </p>
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
