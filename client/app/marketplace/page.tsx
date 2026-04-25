'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { agentApi } from '@/api/agent-api';
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/buttons/button';
import { Badge } from '@/components/ui/feedback/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/selection/select';
import {
    IconSearch, IconStar, IconEye, IconShoppingCart, IconLoader2, IconRobot,
    IconTrendingUp, IconPackage, IconFilter, IconUser, IconBolt,
    IconArrowRight,
    IconCpu
} from '@tabler/icons-react';
import { Navigation } from '@/components/landing/navigation';

const CATEGORIES     = ['All', 'Trading Bot', 'Analytics', 'DeFi Assistant', 'Portfolio Manager', 'Data Feed', 'Custom'];
const NETWORKS       = ['All', 'Ethereum', 'CKB', 'Solana', 'Polygon'];
const PRICING_FILTERS = [
  { label: 'All',  value: 'all'  },
  { label: 'Free', value: 'free' },
  { label: 'Paid', value: 'paid' },
];

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ── Agent Card ────────────────────────────────────────────────────
function AgentCard({ agent, index }: { agent: any; index: number }) {
  const router   = useRouter();
  const mkt      = agent.marketplace || {};
  const isFree   = mkt.pricing?.type !== 'paid';
  const price    = mkt.pricing?.price;
  const currency = mkt.pricing?.currency || 'USD';
  const category = mkt.category || 'Custom';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease }}
      className="group"
    >
      <div
        onClick={() => router.push(`/marketplace/agent/${agent._id}`)}
        className="relative flex flex-col h-full glass-card rounded-2xl border border-border/40 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-3">
          <Badge className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-wider">
            {category}
          </Badge>
        </div>

        <div className="p-6 flex flex-col h-full">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <IconCpu className="w-6 h-6 text-primary" />
          </div>

          <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
            {agent.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1 leading-relaxed">
            {agent.description || 'No description provided.'}
          </p>

          <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/40">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <IconEye className="h-3.5 w-3.5" />
                <span>{mkt.stats?.views || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <IconStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{(mkt.stats?.rating || 0).toFixed(1)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className={isFree ? "text-emerald-500 font-bold text-sm" : "text-foreground font-black text-sm"}>
                {isFree ? 'FREE' : `${currency} ${price}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const [agents,    setAgents]   = useState<any[]>([]);
  const [total,     setTotal]    = useState(0);
  const [isLoading, setLoading]  = useState(true);
  const [search,    setSearch]   = useState('');
  const [category,  setCategory] = useState('All');
  const [network,   setNetwork]  = useState('All');
  const [pricing,   setPricing]  = useState('all');
  const [page,      setPage]     = useState(1);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await agentApi.getMarketplace({
        search:   search   || undefined,
        category: category !== 'All' ? category : undefined,
        network:  network  !== 'All' ? network  : undefined,
        pricing:  pricing  !== 'all' ? (pricing as any) : undefined,
        page,
        limit: 18,
      });
      setAgents(data.agents);
      setTotal(data.total);
    } catch {
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, network, pricing, page]);

  useEffect(() => {
    const t = setTimeout(fetchAgents, 300);
    return () => clearTimeout(t);
  }, [fetchAgents]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navigation />
      
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-6 py-20">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
              <IconPackage className="w-3 h-3" /> Agent Ecosystem
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Marketplace
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
              Discover and deploy pre-trained AI agents for trading, security, and treasury management.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
             <div className="text-right hidden sm:block">
              <p className="text-3xl font-black leading-none">{total}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Agents</p>
            </div>
            <Link href="/sandbox">
              <button className="h-14 px-8 bg-primary text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                <IconBolt className="w-5 h-5" /> Create Agent
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Filters Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-[2rem] p-4 mb-12 flex flex-wrap items-center gap-4 border-border/40"
        >
          <div className="relative flex-1 min-w-[280px]">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, capability or category..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-12 pl-12 pr-4 bg-background/50 border border-border/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="w-44 h-12 bg-background/50 border-border/40 rounded-xl text-xs font-bold uppercase tracking-wider">
                <IconFilter className="w-4 h-4 mr-2 opacity-50" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className="text-xs font-medium uppercase tracking-wider">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={network} onValueChange={(v) => { setNetwork(v); setPage(1); }}>
              <SelectTrigger className="w-36 h-12 bg-background/50 border-border/40 rounded-xl text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Network" />
              </SelectTrigger>
              <SelectContent>
                {NETWORKS.map(n => (
                  <SelectItem key={n} value={n} className="text-xs font-medium uppercase tracking-wider">{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex bg-background/50 border border-border/40 rounded-xl p-1 h-12">
              {PRICING_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => { setPricing(f.value); setPage(1); }}
                  className={`px-6 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    pricing === f.value
                      ? 'bg-primary text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 gap-4"
            >
              <IconLoader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Synchronizing Marketplace...</p>
            </motion.div>
          ) : agents.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-40 glass-card rounded-[2rem] border-dashed border-2 border-border/40"
            >
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
                <IconRobot className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No agents matching your criteria</h2>
              <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {agents.map((agent, i) => (
                <AgentCard key={agent._id} agent={agent} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {total > 18 && (
          <div className="flex justify-center items-center gap-6 mt-20">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-10 px-6 bg-background border border-border/40 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:border-primary/50 transition-all"
            >
              Previous
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Page <span className="text-foreground">{page}</span> of {Math.ceil(total / 18)}
            </span>
            <button
              disabled={page >= Math.ceil(total / 18)}
              onClick={() => setPage(page + 1)}
              className="h-10 px-6 bg-background border border-border/40 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:border-primary/50 transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
