'use client';

import { BrainCircuit } from 'lucide-react';
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui';

interface AICharacterSectionProps {
    nodeData: any;
    nodeId: string;
    updateNodeData: (nodeId: string, data: any) => void;
    setNodeData: (data: any) => void;
}

export function AICharacterSection({ nodeData, nodeId, updateNodeData, setNodeData }: AICharacterSectionProps) {
    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
            <h4 className="font-semibold text-primary flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                AI & Character
            </h4>

            <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold">Model Provider</Label>
                    <Select
                        value={nodeData.modelProvider || 'gemini'}
                        onValueChange={(val) => {
                            const updatedData = { ...nodeData, modelProvider: val };
                            setNodeData(updatedData);
                            updateNodeData(nodeId, updatedData);
                        }}
                    >
                        <SelectTrigger className="bg-background">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gemini">Google Gemini</SelectItem>
                            <SelectItem value="openai">OpenAI (Pro)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider font-bold">Character Identity</Label>
                    <div className="flex gap-2">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="char-name" className="text-[10px] uppercase">Name</Label>
                            <Input
                                id="char-name"
                                placeholder="e.g. Zen Trader"
                                className="bg-background"
                                value={nodeData.character?.name || ''}
                                onChange={(e) => {
                                    const updatedData = {
                                        ...nodeData,
                                        character: { ...nodeData.character, name: e.target.value }
                                    };
                                    setNodeData(updatedData);
                                    updateNodeData(nodeId, updatedData);
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="char-bio" className="text-xs uppercase tracking-wider font-bold">Bio / Personality</Label>
                    <Textarea
                        id="char-bio"
                        placeholder="Describe the agent's background and vibe..."
                        className="bg-background min-h-[80px] text-sm"
                        value={nodeData.character?.bio || ''}
                        onChange={(e) => {
                            const updatedData = {
                                ...nodeData,
                                character: { ...nodeData.character, bio: e.target.value }
                            };
                            setNodeData(updatedData);
                            updateNodeData(nodeId, updatedData);
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="char-instr" className="text-xs uppercase tracking-wider font-bold">System Instructions</Label>
                    <Textarea
                        id="char-instr"
                        placeholder="Primary rules for the AI (one per line)..."
                        className="bg-background min-h-[100px] text-sm font-mono"
                        value={nodeData.character?.instructions?.join('\n') || ''}
                        onChange={(e) => {
                            const instructions = e.target.value.split('\n').filter(i => i.trim() !== '');
                            const updatedData = {
                                ...nodeData,
                                character: { ...nodeData.character, instructions }
                            };
                            setNodeData(updatedData);
                            updateNodeData(nodeId, updatedData);
                        }}
                    />
                    <p className="text-[10px] italic">
                        Press enter for multiple instructions.
                    </p>
                </div>
            </div>
        </div>
    );
}
