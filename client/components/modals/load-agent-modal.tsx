'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/overlays/dialog';
import { Button } from '@/components/ui/buttons/button';
import { Input } from '@/components/ui/forms/input';
import { useAgentManager } from '@/hooks';
import { Trash2, Search, User, ExternalLink, Loader2 } from 'lucide-react';

interface LoadAgentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (agentId: string) => void;
}

export default function LoadAgentModal({ isOpen, onClose, onSelect }: LoadAgentModalProps) {
    const { listAgents, deleteAgent } = useAgentManager();
    const [agents, setAgents] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchAgents = async () => {
        setIsLoading(true);
        const data = await listAgents();
        setAgents(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen) fetchAgents();
    }, [isOpen]);

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this agent? This cannot be undone.')) {
            const success = await deleteAgent(id);
            if (success) {
                setAgents(agents.filter(a => a._id !== id));
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] border-primary/20 bg-card/95 backdrop-blur-xl shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Load Agent Workflow</DialogTitle>
                    <DialogDescription>
                        Select an existing agent to load its configuration and flow into the sandbox.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search agents by name or description..."
                        className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/20">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p>Fetching your agents...</p>
                        </div>
                    ) : filteredAgents.length > 0 ? (
                        filteredAgents.map((agent) => (
                            <div
                                key={agent._id}
                                onClick={() => {
                                    onSelect(agent._id);
                                    onClose();
                                }}
                                className="group p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">{agent.name}</h4>
                                        <p className="text-xs line-clamp-1 max-w-[300px]">
                                            {agent.description || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDelete(e, agent._id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    <ExternalLink className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-border/50 rounded-2xl">
                            <p className="text-sm italic">No agents found matching your search.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
