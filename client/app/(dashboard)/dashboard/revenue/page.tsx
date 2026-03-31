'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiFetch } from '@/lib/api-client';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    Bot, TrendingUp, ShoppingCart, DollarSign, Eye, CheckCircle2,
    Circle, Package, Coins, Crown,
} from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
    free:      { label: 'Free',      color: 'text-zinc-400' },
    starter:   { label: 'Starter',   color: 'text-[#9AB17A]' },
    pro:       { label: 'Pro',       color: 'text-[#C3CC9B]' },
    unlimited: { label: 'Unlimited', color: 'text-[#FBE8CE]' },
};

function StatCard({ icon: Icon, label, value, sub, delay }: {
    icon: React.ElementType; label: string; value: string; sub?: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease }}
            className="rounded-2xl border border-border/60 bg-card p-5 space-y-3"
        >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
                <div className="text-2xl font-extrabold tracking-tight">{value}</div>
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
                {sub && <div className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</div>}
            </div>
        </motion.div>
    );
}

function AgentRow({ agent, index }: { agent: any; index: number }) {
    return (
        <motion.tr
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.05 + index * 0.04, ease }}
            className="border-b border-border/40 hover:bg-muted/20 transition-colors"
        >
            <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight">{agent.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">
                            {agent.agentType?.replace(/_/g, ' ')}
                        </p>
                    </div>
                </div>
            </td>
            <td className="py-3 px-4 text-center">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    agent.published
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-muted text-muted-foreground border border-border/40'
                }`}>
                    {agent.published ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Circle className="w-2.5 h-2.5" />}
                    {agent.published ? 'Listed' : agent.isDraft ? 'Draft' : 'Unlisted'}
                </span>
            </td>
            <td className="py-3 px-4 text-center text-sm tabular-nums">{agent.views.toLocaleString()}</td>
            <td className="py-3 px-4 text-center text-sm tabular-nums">{agent.purchases}</td>
            <td className="py-3 px-4 text-right text-sm font-semibold">
                {agent.revenue > 0 ? `$${agent.revenue.toFixed(2)}` : '—'}
            </td>
        </motion.tr>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-card border border-border/60 rounded-xl px-4 py-3 text-xs shadow-xl">
            <p className="font-semibold mb-2 text-muted-foreground">{label}</p>
            {payload.map((p: any) => (
                <p key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-6">
                    <span className="capitalize">{p.dataKey}</span>
                    <span className="font-bold tabular-nums">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

export default function RevenuePage() {
    const [data, setData]       = useState<any>(null);
    const [user, setUser]       = useState<any>(null);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch('/agents/revenue'),
            apiFetch('/auth/me'),
        ])
            .then(([rev, me]) => { setData(rev); setUser(me); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 gap-3">
                <TrendingUp className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Loading revenue data…</span>
            </div>
        );
    }

    const planInfo = PLAN_LABELS[user?.plan ?? 'free'];

    // Downsample chart to every 3 days for cleaner look
    const chartData = (data?.chartData ?? []).filter((_: any, i: number) => i % 3 === 0);

    return (
        <div className="min-h-full bg-background">
            <div className="max-w-7xl mx-auto px-5 py-7 space-y-7">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    className="flex items-start justify-between"
                >
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Revenue</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Marketplace performance &amp; earnings
                        </p>
                    </div>

                    {/* Plan + token badge */}
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-card text-sm">
                                <Coins className="w-4 h-4 text-[#FBE8CE]" />
                                <span className="font-bold tabular-nums">{(user.tokens ?? 0).toLocaleString()}</span>
                                <span className="text-muted-foreground text-xs">tokens</span>
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/60 bg-card text-sm font-bold ${planInfo.color}`}>
                                <Crown className="w-3.5 h-3.5" />
                                {planInfo.label}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Stats strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Bot}         label="Agents Created"   value={String(data?.agents?.length ?? 0)}     delay={0}     />
                    <StatCard icon={Package}     label="Listed on Market" value={String(data?.agents?.filter((a: any) => a.published).length ?? 0)} delay={0.05} />
                    <StatCard icon={ShoppingCart} label="Total Purchases" value={String(data?.totalPurchases ?? 0)}      delay={0.1}   />
                    <StatCard icon={DollarSign}  label="Total Revenue"    value={`$${(data?.totalRevenue ?? 0).toFixed(2)}`} delay={0.15} />
                </div>

                {/* Chart */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease }}
                    className="rounded-2xl border border-border/60 bg-card p-6"
                >
                    <h2 className="text-sm font-bold mb-5">Activity — Last 30 Days</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gPurchases" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#9AB17A" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#9AB17A" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#FBE8CE" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FBE8CE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.07} />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                                    tickFormatter={(v) => v.slice(5)} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }}
                                    axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8}
                                    formatter={(v) => <span className="text-[11px] text-muted-foreground capitalize">{v}</span>} />
                                <Area type="monotone" dataKey="purchases" stroke="#9AB17A" strokeWidth={2}
                                    fill="url(#gPurchases)" dot={false} />
                                <Area type="monotone" dataKey="revenue" stroke="#FBE8CE" strokeWidth={2}
                                    fill="url(#gRevenue)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[240px] flex flex-col items-center justify-center gap-2 border border-dashed border-border/50 rounded-xl">
                            <Eye className="w-8 h-8 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground">No purchase activity yet</p>
                            <p className="text-xs text-muted-foreground/60">Publish an agent to the marketplace to start earning</p>
                        </div>
                    )}
                </motion.div>

                {/* Agent breakdown table */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.25, ease }}
                    className="rounded-2xl border border-border/60 bg-card overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-border/40">
                        <h2 className="text-sm font-bold">Your Agents</h2>
                    </div>
                    {data?.agents?.length > 0 ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/20">
                                    <th className="text-left py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Agent</th>
                                    <th className="text-center py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    <th className="text-center py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Views</th>
                                    <th className="text-center py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Purchases</th>
                                    <th className="text-right py-2.5 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.agents.map((agent: any, i: number) => (
                                    <AgentRow key={agent._id} agent={agent} index={i} />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-16 text-center">
                            <Bot className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No agents created yet</p>
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
}
