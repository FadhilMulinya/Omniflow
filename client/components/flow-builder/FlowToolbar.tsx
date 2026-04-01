'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/buttons/button';
import { Panel } from '@xyflow/react';
import { Badge } from '@/components/ui/feedback/badge';
import { createPortal } from 'react-dom';
import {
    Plus, Save, Upload, Key, Share2, Rocket, MessageSquare,
    Loader2, MoreVertical, Play, Square, ExternalLink,
} from 'lucide-react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface FlowToolbarProps {
    isSaving: boolean;
    currentAgentId: string | null;
    currentAgent: any;
    isSimulating: boolean;
    onApiKeys: () => void;
    onAddNode: () => void;
    onSave: () => void;
    onLoad: () => void;
    onTemplates: () => void;
    onToggleSimulation: () => void;
    onPublish: () => void;
    onChat: () => void;
    onExport: () => void;
}

function StatusBadge({ currentAgent }: { currentAgent: any }) {
    if (!currentAgent) return null;
    return (
        <Badge className={currentAgent?.isDraft
            ? 'bg-muted text-muted-foreground hover:bg-muted border-border/60'
            : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20'}>
            {currentAgent?.isDraft
                ? <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Draft</span>
                : <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Published</span>}
        </Badge>
    );
}

function DesktopToolbar(props: FlowToolbarProps) {
    const { isSaving, currentAgentId, currentAgent, isSimulating,
        onApiKeys, onAddNode, onSave, onLoad, onTemplates,
        onToggleSimulation, onPublish, onChat, onExport } = props;

    return (
        <Panel position="top-right" className="hidden md:flex gap-2 items-center">
            {isSaving && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground bg-primary px-2.5 py-1 rounded-md animate-pulse shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </div>
            )}

            {currentAgentId && (
                <div className="flex items-center gap-1.5 mr-1 pr-2 border-r border-border/60">
                    <StatusBadge currentAgent={currentAgent} />
                    {currentAgent?.isDraft && (
                        <Button size="sm" variant="default" className="h-8 px-2" onClick={onPublish}>
                            <Rocket className="h-3.5 w-3.5 mr-1" /> Publish
                        </Button>
                    )}
                    <Button size="sm" variant="default" className="h-8 px-2" onClick={onChat}>
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Interact
                    </Button>
                    <Button size="sm" variant="default" className="h-8 px-2" onClick={onExport}>
                        <Share2 className="h-3.5 w-3.5 mr-1" /> Export
                    </Button>
                </div>
            )}

            <Button variant="default" size="sm" onClick={onApiKeys}>
                <Key className="h-4 w-4 mr-2" /> API Keys
                <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
            </Button>
            <Button variant="default" size="sm" onClick={onAddNode}>
                <Plus className="h-4 w-4 mr-2" /> Add Node
            </Button>
            <Button variant="default" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                {currentAgentId ? 'Save Flow' : 'Create Agent'}
            </Button>
            <div className="flex rounded-md overflow-hidden shadow-sm">
                <Button variant="default" size="sm" className="rounded-none border-r border-primary-foreground/20 h-9 px-3" onClick={onLoad}>
                    <Upload className="h-4 w-4 mr-2" /> Load Agent
                </Button>
                <Button variant="default" size="sm" className="rounded-none h-9 px-3 font-semibold" onClick={onTemplates}>
                    Templates
                </Button>
            </div>
            <Button variant={isSimulating ? 'destructive' : 'default'} size="sm" onClick={onToggleSimulation}>
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
            </Button>
        </Panel>
    );
}

function MobileToolbar(props: FlowToolbarProps) {
    const { isSaving, currentAgentId, currentAgent, isSimulating,
        onApiKeys, onAddNode, onSave, onLoad, onTemplates,
        onToggleSimulation, onPublish, onChat, onExport } = props;
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    const close = (fn: () => void) => () => { fn(); setOpen(false); };

    if (!mounted) return null;

    return createPortal(
        <div className="md:hidden">
            <div className="fixed top-0 right-0 z-[60] h-12 flex items-center gap-1.5 pr-3">
                {isSaving && (
                    <div className="flex items-center gap-1 text-[10px] font-medium text-primary-foreground bg-primary px-2 py-1 rounded-md animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" /> Saving
                    </div>
                )}

                {currentAgentId && <StatusBadge currentAgent={currentAgent} />}

                <Button
                    size="sm"
                    variant={isSimulating ? 'destructive' : 'default'}
                    className="h-7 px-2.5 text-[11px] font-semibold"
                    onClick={onToggleSimulation}
                >
                    {isSimulating
                        ? <><Square className="h-3 w-3 mr-1" /> Stop</>
                        : <><Play className="h-3 w-3 mr-1" /> Run</>}
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-7 p-0"
                    onClick={() => setOpen(o => !o)}
                    aria-label="More options"
                >
                    <MoreVertical className="h-3.5 w-3.5" />
                </Button>
            </div>

            {open && (
                <div className="fixed top-12 right-2 z-[60] w-52 rounded-xl border border-border/60 bg-background shadow-2xl overflow-hidden">
                    {currentAgentId && (
                        <div className="border-b border-border/60 p-1">
                            {currentAgent?.isDraft && (
                                <button onClick={close(onPublish)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-colors">
                                    <Rocket className="h-4 w-4 text-muted-foreground" /> Publish
                                </button>
                            )}
                            <button onClick={close(onChat)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-colors">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" /> Interact
                            </button>
                            <button onClick={close(onExport)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-colors">
                                <Share2 className="h-4 w-4 text-muted-foreground" /> Export
                            </button>
                        </div>
                    )}
                    <div className="p-1">
                        <button onClick={close(onAddNode)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-colors">
                            <Plus className="h-4 w-4 text-muted-foreground" /> Add Node
                        </button>
                        <button onClick={close(onSave)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-colors">
                            <Save className="h-4 w-4 text-muted-foreground" /> {currentAgentId ? 'Save Flow' : 'Create Agent'}
                        </button>
                        <button onClick={close(onLoad)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-colors">
                            <Upload className="h-4 w-4 text-muted-foreground" /> Load Agent
                        </button>
                        <button onClick={close(onTemplates)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-colors">
                            <span className="h-4 w-4 text-muted-foreground text-xs font-bold flex items-center justify-center">T</span> Templates
                        </button>
                        <button onClick={close(onApiKeys)} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-foreground hover:bg-accent/40 rounded-lg transition-colors">
                            <Key className="h-4 w-4 text-muted-foreground" /> API Keys
                            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground/50" />
                        </button>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
}

export function FlowToolbar(props: FlowToolbarProps) {
    return (
        <>
            <DesktopToolbar {...props} />
            <MobileToolbar {...props} />
        </>
    );
}
