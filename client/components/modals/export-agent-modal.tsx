'use client';

import { useState } from 'react';
import JSZip from 'jszip';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/overlays/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/navigation/tabs';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/selection/select';
import { agentApi } from '@/api/agent-api';
import { toast } from '@/components/ui';
import {
    Copy, Check, Download, Code2, Smartphone, ExternalLink, Loader2,
    Store, ChevronDown, ChevronUp,
} from 'lucide-react';

const CATEGORIES = ['Trading Bot', 'Analytics', 'DeFi Assistant', 'Portfolio Manager', 'Data Feed', 'Custom'];
const NETWORKS = ['Ethereum', 'CKB', 'Solana', 'Polygon', 'BNB Chain'];
const ASSETS: Record<string, string[]> = {
    Ethereum: ['ETH', 'USDT', 'USDC'],
    CKB: ['CKB'],
    Solana: ['SOL', 'USDC'],
    Polygon: ['MATIC', 'USDT'],
    'BNB Chain': ['BNB', 'USDT'],
};

interface ExportAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentId: string;
    agentName: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} title="Copy to clipboard"
            className="absolute top-2 right-2 p-1.5 rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
    );
}

function CodeBlock({ code, label }: { code: string; label: string }) {
    return (
        <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="relative">
                <pre className="bg-zinc-950 text-green-400 text-xs p-3 pr-10 rounded-lg overflow-x-auto font-mono border border-border/50 leading-relaxed whitespace-pre-wrap break-all">
                    {code}
                </pre>
                <CopyButton text={code} />
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ExportAgentModal({ isOpen, onClose, agentId, agentName }: ExportAgentModalProps) {
    // Embed state
    const [embedData, setEmbedData] = useState<{ embedUrl: string; iframeSnippet: string; scriptSnippet: string } | null>(null);
    const [isEnablingEmbed, setIsEnablingEmbed] = useState(false);
    const [allowedDomains, setAllowedDomains] = useState('');
    const [allowedIPs, setAllowedIPs] = useState('');

    // PWA state
    const [isDownloadingPwa, setIsDownloadingPwa] = useState(false);

    // Marketplace state
    const [showMarketplace, setShowMarketplace] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [mktCategory, setMktCategory] = useState('Custom');
    const [mktVisibility, setMktVisibility] = useState<'public' | 'unlisted'>('public');
    const [mktPricingType, setMktPricingType] = useState<'free' | 'paid'>('free');
    const [mktPrice, setMktPrice] = useState('');
    const [mktCurrency, setMktCurrency] = useState('USD');
    const [mktStripe, setMktStripe] = useState(false);
    const [mktCrypto, setMktCrypto] = useState(false);
    const [mktCryptoWallet, setMktCryptoWallet] = useState('');
    const [mktCryptoNetwork, setMktCryptoNetwork] = useState('Ethereum');
    const [mktCryptoAsset, setMktCryptoAsset] = useState('ETH');
    const [mktCryptoAmount, setMktCryptoAmount] = useState('');

    // ── Embed ─────────────────────────────────────────────────────────────────

    const handleEnableEmbed = async () => {
        setIsEnablingEmbed(true);
        try {
            const domains = allowedDomains.split(',').map((s) => s.trim()).filter(Boolean);
            const ips = allowedIPs.split(',').map((s) => s.trim()).filter(Boolean);
            const data = await agentApi.exportEmbed(agentId, { allowedDomains: domains, allowedIPs: ips, theme: 'dark' });
            setEmbedData(data);
            toast({ title: 'Embed Enabled', description: 'Your embed snippets are ready.' });
        } catch {
            toast({ title: 'Failed to enable embed', variant: 'destructive' });
        } finally {
            setIsEnablingEmbed(false);
        }
    };

    // ── PWA ───────────────────────────────────────────────────────────────────

    const handleDownloadPwa = async () => {
        setIsDownloadingPwa(true);
        try {
            const { agentConfig, agentName: name } = await agentApi.exportPwa(agentId);
            const zip = await buildPwaZip(agentConfig, name);
            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name.toLowerCase().replace(/\s+/g, '-')}-pwa.zip`;
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: 'PWA Downloaded', description: `${name}-pwa.zip ready.` });
        } catch {
            toast({ title: 'PWA Download Failed', variant: 'destructive' });
        } finally {
            setIsDownloadingPwa(false);
        }
    };

    // ── Marketplace ───────────────────────────────────────────────────────────

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            await agentApi.publishToMarketplace(agentId, {
                published: true,
                category: mktCategory,
                visibility: mktVisibility,
                pricing: { type: mktPricingType, price: mktPricingType === 'paid' ? parseFloat(mktPrice) || 0 : 0, currency: mktCurrency },
                paymentMethods: {
                    stripe: { enabled: mktStripe },
                    crypto: {
                        enabled: mktCrypto,
                        walletAddress: mktCryptoWallet,
                        network: mktCryptoNetwork,
                        asset: mktCryptoAsset,
                        amount: parseFloat(mktCryptoAmount) || 0,
                    },
                },
            });
            toast({ title: 'Published!', description: `${agentName} is now on the marketplace.` });
            onClose();
            window.location.href = '/dashboard/revenue';
        } catch (e: any) {
            toast({ title: 'Publish failed', description: e.message, variant: 'destructive' });
        } finally {
            setIsPublishing(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <ExternalLink className="h-5 w-5 text-primary" />
                        Export Agent
                    </DialogTitle>
                    <DialogDescription>
                        Share <strong>{agentName}</strong> as a widget, PWA, or list it on the marketplace.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="embed" className="mt-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="embed" className="flex items-center gap-1.5">
                            <Code2 className="h-3.5 w-3.5" /> Embed
                        </TabsTrigger>
                        <TabsTrigger value="pwa" className="flex items-center gap-1.5">
                            <Smartphone className="h-3.5 w-3.5" /> Download PWA
                        </TabsTrigger>
                        <TabsTrigger value="marketplace" className="flex items-center gap-1.5">
                            <Store className="h-3.5 w-3.5" /> Marketplace
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Embed Tab ── */}
                    <TabsContent value="embed" className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                            Generate a public embed URL. In production, restrict access by domain and/or IP.
                        </p>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    Allowed Domains <span className="opacity-60">(comma-separated, leave empty to allow all)</span>
                                </label>
                                <Input
                                    placeholder="myapp.com, dashboard.io"
                                    value={allowedDomains}
                                    onChange={(e) => setAllowedDomains(e.target.value)}
                                    className="bg-muted/30 border-border/50 text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                    Allowed IPs <span className="opacity-60">(comma-separated, leave empty to allow all)</span>
                                </label>
                                <Input
                                    placeholder="192.168.1.1, 41.139.20.5"
                                    value={allowedIPs}
                                    onChange={(e) => setAllowedIPs(e.target.value)}
                                    className="bg-muted/30 border-border/50 text-sm"
                                />
                            </div>
                        </div>

                        {!embedData ? (
                            <Button onClick={handleEnableEmbed} disabled={isEnablingEmbed} className="w-full">
                                {isEnablingEmbed ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Code2 className="h-4 w-4 mr-2" />}
                                Generate Embed Snippets
                            </Button>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground">Embed URL</p>
                                    <div className="relative">
                                        <code className="block bg-muted/40 text-xs px-3 py-2 pr-10 rounded-lg border border-border/50 break-all font-mono">
                                            {embedData.embedUrl}
                                        </code>
                                        <CopyButton text={embedData.embedUrl} />
                                    </div>
                                </div>
                                <CodeBlock label="iframe snippet" code={embedData.iframeSnippet} />
                                <CodeBlock label="Script tag snippet" code={embedData.scriptSnippet} />
                                <Button variant="outline" size="sm" onClick={handleEnableEmbed} disabled={isEnablingEmbed}>
                                    {isEnablingEmbed && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                                    Regenerate
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* ── PWA Tab ── */}
                    <TabsContent value="pwa" className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                            Download a self-contained PWA that wraps this agent. Installs as a standalone app on any device.
                        </p>
                        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2 text-sm">
                            <p className="font-medium">Package contents</p>
                            <ul className="text-muted-foreground space-y-1 text-xs list-disc list-inside">
                                <li><code>index.html</code> — standalone chat UI</li>
                                <li><code>manifest.json</code> — app name, icon, display: standalone</li>
                                <li><code>sw.js</code> — service worker for offline shell caching</li>
                                <li><code>agent-config.json</code> — full agent definition</li>
                            </ul>
                        </div>
                        <Button onClick={handleDownloadPwa} disabled={isDownloadingPwa} className="w-full">
                            {isDownloadingPwa ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                            {isDownloadingPwa ? 'Packaging…' : `Download ${agentName} PWA`}
                        </Button>
                    </TabsContent>

                    {/* ── Marketplace Tab ── */}
                    <TabsContent value="marketplace" className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                            List this agent on the FlawLess marketplace. The agent must be published first.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                                <Select value={mktCategory} onValueChange={setMktCategory}>
                                    <SelectTrigger className="bg-muted/30 border-border/50 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Visibility</label>
                                <Select value={mktVisibility} onValueChange={(v) => setMktVisibility(v as any)}>
                                    <SelectTrigger className="bg-muted/30 border-border/50 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="public">Public</SelectItem>
                                        <SelectItem value="unlisted">Unlisted</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Pricing</label>
                            <div className="flex gap-2">
                                {(['free', 'paid'] as const).map((t) => (
                                    <button key={t} onClick={() => setMktPricingType(t)}
                                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${mktPricingType === t ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border/50 hover:bg-muted/50'}`}>
                                        {t === 'free' ? 'Free' : 'Paid'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {mktPricingType === 'paid' && (
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Price</label>
                                    <Input type="number" min="0" step="0.01" placeholder="9.99"
                                        value={mktPrice} onChange={(e) => setMktPrice(e.target.value)}
                                        className="bg-muted/30 border-border/50 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
                                    <Select value={mktCurrency} onValueChange={setMktCurrency}>
                                        <SelectTrigger className="bg-muted/30 border-border/50 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {mktPricingType === 'paid' && (
                            <div className="space-y-3">
                                <p className="text-xs font-medium text-muted-foreground">Payment Methods</p>

                                {/* Stripe toggle */}
                                <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                                    <div>
                                        <p className="text-sm font-medium">Stripe</p>
                                        <p className="text-xs text-muted-foreground">Credit / debit card via Stripe Connect</p>
                                    </div>
                                    <button onClick={() => setMktStripe(!mktStripe)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${mktStripe ? 'bg-primary' : 'bg-muted'}`}>
                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${mktStripe ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>

                                {/* Crypto toggle */}
                                <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Crypto Wallet</p>
                                            <p className="text-xs text-muted-foreground">Buyer pays directly to your wallet</p>
                                        </div>
                                        <button onClick={() => setMktCrypto(!mktCrypto)}
                                            className={`w-10 h-5 rounded-full transition-colors relative ${mktCrypto ? 'bg-primary' : 'bg-muted'}`}>
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${mktCrypto ? 'translate-x-5' : ''}`} />
                                        </button>
                                    </div>

                                    {mktCrypto && (
                                        <div className="space-y-2 pt-1">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Network</label>
                                                    <Select value={mktCryptoNetwork} onValueChange={(v) => { setMktCryptoNetwork(v); setMktCryptoAsset(ASSETS[v]?.[0] || ''); }}>
                                                        <SelectTrigger className="bg-muted/40 border-border/50 text-sm h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {NETWORKS.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-muted-foreground mb-1 block">Asset</label>
                                                    <Select value={mktCryptoAsset} onValueChange={setMktCryptoAsset}>
                                                        <SelectTrigger className="bg-muted/40 border-border/50 text-sm h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(ASSETS[mktCryptoNetwork] || []).map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <Input placeholder="Wallet address" value={mktCryptoWallet}
                                                onChange={(e) => setMktCryptoWallet(e.target.value)}
                                                className="bg-muted/40 border-border/50 text-xs font-mono h-8" />
                                            <Input type="number" min="0" step="0.0001" placeholder={`Amount in ${mktCryptoAsset}`}
                                                value={mktCryptoAmount} onChange={(e) => setMktCryptoAmount(e.target.value)}
                                                className="bg-muted/40 border-border/50 text-sm h-8" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button onClick={handlePublish} disabled={isPublishing} className="w-full">
                            {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Store className="h-4 w-4 mr-2" />}
                            {isPublishing ? 'Publishing…' : 'Publish to Marketplace'}
                        </Button>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

// ── PWA file builders ────────────────────────────────────────────────────────

async function buildPwaZip(agentConfig: any, agentName: string): Promise<JSZip> {
    const zip = new JSZip();
    zip.file('agent-config.json', JSON.stringify(agentConfig, null, 2));
    zip.file('manifest.json', JSON.stringify(buildManifest(agentName), null, 2));
    zip.file('sw.js', buildServiceWorker(agentName));
    zip.file('index.html', buildIndexHtml(agentConfig, agentName));
    return zip;
}

function buildManifest(agentName: string) {
    return {
        name: agentName,
        short_name: agentName.substring(0, 12),
        description: `${agentName} — powered by FlawLess`,
        start_url: '/',
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#7c3aed',
        icons: [
            { src: 'https://placehold.co/192x192/7c3aed/ffffff?text=AI', sizes: '192x192', type: 'image/png' },
            { src: 'https://placehold.co/512x512/7c3aed/ffffff?text=AI', sizes: '512x512', type: 'image/png' },
        ],
    };
}

function buildServiceWorker(agentName: string) {
    const cacheName = agentName.toLowerCase().replace(/\s+/g, '-') + '-v1';
    return `// ${agentName} PWA — Service Worker
const CACHE_NAME = '${cacheName}';
const SHELL = ['/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(e.request));
  } else {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
  }
});
`;
}

function buildIndexHtml(agentConfig: any, agentName: string) {
    const apiUrl = (agentConfig.apiUrl || 'http://localhost:3001/api').replace(/\/$/, '');
    const agentId = agentConfig.id;
    const bio = agentConfig.character?.bio || agentConfig.description || '';
    const chatEndpoint = `${apiUrl}/embed/agent/${agentId}/chat`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${agentName}</title>
  <meta name="theme-color" content="#7c3aed" />
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#09090b;color:#fafafa;display:flex;flex-direction:column;height:100dvh}
    header{padding:14px 16px;background:#18181b;border-bottom:1px solid #27272a;display:flex;align-items:center;gap:10px}
    .avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;flex-shrink:0}
    .agent-info h1{font-size:15px;font-weight:600}.agent-info p{font-size:12px;color:#71717a}
    #messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}
    .msg{max-width:80%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5}
    .msg.user{align-self:flex-end;background:#7c3aed;color:#fff;border-bottom-right-radius:4px}
    .msg.agent{align-self:flex-start;background:#27272a;color:#fafafa;border-bottom-left-radius:4px}
    .msg.thinking{color:#71717a;font-style:italic}
    form{padding:12px 16px;background:#18181b;border-top:1px solid #27272a;display:flex;gap:8px}
    textarea{flex:1;resize:none;background:#27272a;border:1px solid #3f3f46;color:#fafafa;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;outline:none;max-height:120px}
    textarea:focus{border-color:#7c3aed}
    button[type=submit]{background:#7c3aed;color:#fff;border:none;border-radius:10px;padding:0 16px;font-size:14px;font-weight:600;cursor:pointer;min-width:64px;transition:background .15s}
    button[type=submit]:disabled{background:#52525b;cursor:not-allowed}
    button[type=submit]:hover:not(:disabled){background:#6d28d9}
  </style>
</head>
<body>
  <header>
    <div class="avatar">${agentName.charAt(0).toUpperCase()}</div>
    <div class="agent-info">
      <h1>${agentName}</h1>
      <p>${bio.substring(0, 80)}${bio.length > 80 ? '…' : ''}</p>
    </div>
  </header>
  <div id="messages">
    <div class="msg agent">Hi! I'm ${agentName}. How can I help you today?</div>
  </div>
  <form id="chat-form">
    <textarea id="input" placeholder="Message ${agentName}…" rows="1"></textarea>
    <button type="submit" id="send-btn">Send</button>
  </form>
  <script>
    // Service workers require https:// — skip when opened as a local file
    if ('serviceWorker' in navigator && location.protocol !== 'null:' && location.protocol !== 'about:') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const CHAT_ENDPOINT = '${chatEndpoint}';
    const SESSION_ID = 'pwa_${agentId}_' + Date.now();  // unique per page load
    const messagesEl = document.getElementById('messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');
    function appendMsg(role, text) {
      const div = document.createElement('div');
      div.className = 'msg ' + role;
      div.textContent = text;
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return div;
    }
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const prompt = input.value.trim();
      if (!prompt) return;
      input.value = '';
      appendMsg('user', prompt);
      sendBtn.disabled = true;
      const thinking = appendMsg('agent thinking', 'Thinking…');
      try {
        const res = await fetch(CHAT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, sessionId: SESSION_ID }),
        });
        thinking.remove();
        if (!res.body) throw new Error('No response body');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const msgEl = appendMsg('agent', '');
        let buf = '';
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\\n');
          buf = lines.pop() || '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            try {
              const data = JSON.parse(line.slice(5).trim());
              const token = data.token ?? data.content ?? data.text ?? '';
              if (token) { msgEl.textContent += token; messagesEl.scrollTop = messagesEl.scrollHeight; }
            } catch {}
          }
        }
      } catch (err) {
        thinking.remove();
        appendMsg('agent', 'Sorry, something went wrong. Please try again.');
        console.error(err);
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    });
  </script>
</body>
</html>`;
}
