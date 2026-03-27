'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/overlays/dialog';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { useAgentManager } from '@/hooks';
import { Box, Sparkles, Zap, Shield, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { Label } from '@/components/ui/forms/label';
interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (agent: any) => void;
}

const getTemplateIcon = (id: string) => {
    switch (id) {
        case 'blockchain-multi-step': return <Shield className="h-5 w-5 text-blue-500" />;
        case 'ai-advisor': return <Box className="h-5 w-5 text-purple-500" />;
        case 'telegram-bot': return <Zap className="h-5 w-5 text-yellow-500" />;
        default: return <Sparkles className="h-5 w-5 text-primary" />;
    }
};

export default function TemplateModal({ isOpen, onClose, onSelect }: TemplateModalProps) {
    const { getTemplates, createAgentFromTemplate } = useAgentManager();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
    const [agentName, setAgentName] = useState('');
    const [modelProvider, setModelProvider] = useState('ollama');
    const [modelName, setModelName] = useState('qwen2.5:3b');
    const [apiKey, setApiKey] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            getTemplates().then(data => {
                setTemplates(data || []);
                setIsLoading(false);
            });
        }
    }, [isOpen, getTemplates]);

    // Update model name when provider changes
    useEffect(() => {
        if (modelProvider === 'ollama') setModelName('qwen2.5:3b');
        else if (modelProvider === 'gemini') setModelName('gemini-1.5-flash');
        else if (modelProvider === 'openai') setModelName('gpt-4o-mini');
    }, [modelProvider]);

    const handleConfirmSelection = async () => {
        if (!agentName) return;
        setIsCreating(true);
        try {
            const agent = await createAgentFromTemplate(selectedTemplate.id, agentName, modelProvider, modelName, apiKey);
            onSelect(agent);
            handleClose();
        } catch (error) {
            console.error('Template agent creation failed:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        onClose();
        setSelectedTemplate(null);
        setAgentName('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[700px] border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-bold">
                            {selectedTemplate ? 'Name Your Agent' : 'Flow Templates'}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        {selectedTemplate
                            ? `Give your new agent a name to initialize the "${selectedTemplate.name}" workflow.`
                            : 'Jumpstart your agent with a pre-configured workflow template.'}
                    </DialogDescription>
                </DialogHeader>

                {!selectedTemplate ? (
                    isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="animate-pulse">Loading templates from backend...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    className="group p-5 rounded-2xl border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer flex flex-col justify-between"
                                    onClick={() => setSelectedTemplate(template)}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="bg-card p-2 rounded-lg border border-border/50 shadow-sm group-hover:border-primary/30 transition-colors">
                                                {getTemplateIcon(template.id)}
                                            </div>
                                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-50">Remote Template</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-base group-hover:text-primary transition-colors">{template.name}</h4>
                                            <p className="text-xs mt-1 leading-relaxed line-clamp-2">
                                                {template.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="text-[10px] font-medium text-muted-foreground">
                                            {template.nodes?.length || 0} Nodes • {template.edges?.length || 0} Connections
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 group-hover:bg-primary group-hover:text-white transition-all rounded-lg text-xs font-bold gap-1">
                                            Select
                                            <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="agent-name">Agent Name</Label>
                            <Input
                                id="agent-name"
                                placeholder="e.g. My Blockchain Assistant"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                className="bg-zinc-800/50 border-zinc-700"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="model-select">AI Persona Model</Label>
                            <select
                                id="model-select"
                                value={modelProvider}
                                onChange={(e) => setModelProvider(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-md p-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="ollama">Ollama (qwen2.5:3b - Local)</option>
                                <option value="gemini">Google Gemini (1.5 Flash)</option>
                                <option value="openai">OpenAI (GPT-4o Mini)</option>
                            </select>
                            <p className="text-[10px] text-zinc-500 ml-1">
                                The chosen model will generate your agent's character traits and bio based on the template.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="api-key" className="text-sm">API Key (Optional)</Label>
                            <Input
                                id="api-key"
                                type="password"
                                placeholder={modelProvider === 'ollama' ? "Not required for local models" : `Your ${modelProvider.charAt(0).toUpperCase() + modelProvider.slice(1)} API Key`}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                disabled={modelProvider === 'ollama'}
                                className="bg-zinc-800/50 border-zinc-700"
                            />
                            <p className="text-[10px] text-zinc-500 ml-1">
                                Leave empty to use system default keys
                            </p>
                        </div>

                        {selectedTemplate && (
                            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                                <p className="text-[10px] uppercase text-zinc-500 font-bold mb-2">Including Workflow:</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedTemplate.nodes.map((n: any) => (
                                        <span key={n.id} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] rounded-full border border-zinc-700">
                                            {n.data?.name || n.type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <DialogFooter className="gap-2 sm:gap-0 mt-6">
                            <Button
                                variant="ghost"
                                onClick={() => setSelectedTemplate(null)}
                                className="gap-2 rounded-xl"
                                disabled={isCreating}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                onClick={handleConfirmSelection}
                                disabled={!agentName || isCreating}
                                className="rounded-xl shadow-lg shadow-primary/20 px-8 flex-1 sm:flex-none"
                            >
                                {isCreating ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Zap className="h-4 w-4 mr-2" />
                                )}
                                Initialize Agent
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {!selectedTemplate && (
                    <div className="mt-4 pt-4 border-t border-border/50 text-[10px] text-center italic">
                        Templates are hosted on the backend. New templates are synced automatically.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
