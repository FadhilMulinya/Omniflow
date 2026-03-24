'use client';

import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { X } from 'lucide-react';
import { Button, Label, Separator, Switch } from '@/components/ui';

import { useFlow } from '@/contexts/FlowContext';

// Import sub-components
import { AICharacterSection } from './sections/ai-character-settings';
import { WalletInfoSection } from './sections/wallet-info-section';
import { TradingAnalysisSection } from './sections/trading-analysis-section';
import { TradeInfoSection } from './sections/trade-info-section';
import { FieldRenderer } from './ui/field-renderer';

interface NodeSidebarProps {
    node: Node;
    onClose: () => void;
    updateNodeData: (nodeId: string, data: any) => void;
}

export default function NodeSidebar({ node, onClose, updateNodeData }: NodeSidebarProps) {
    const [nodeData, setNodeData] = useState<any>(node.data);
    const { cascadeNodeExecution } = useFlow();

    useEffect(() => {
        setNodeData(node.data);
    }, [node]);

    const handleInputChange = (key: string, value: any) => {
        const updatedData = { ...nodeData };

        if (updatedData.inputs) {
            const inputIndex = updatedData.inputs.findIndex((input: any) => input.key === key);
            if (inputIndex !== -1) {
                updatedData.inputs[inputIndex].value = value;
            }
        }

        setNodeData(updatedData);
        updateNodeData(node.id, updatedData);

        if (node.data.isPlaying) {
            setTimeout(() => {
                cascadeNodeExecution(node.id);
            }, 0);
        }
    };

    return (
        <div className="w-80 h-full border-l border-border bg-card p-6 overflow-y-auto pb-20 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl">{nodeData.name}</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{nodeData.description}</p>

            <Separator className="my-4" />

            <div className="space-y-4">
                <h4 className="font-medium">Inputs</h4>
                {nodeData.inputs?.map((input: any) => (
                    <div key={input.key} className="space-y-2">
                        <Label htmlFor={input.key}>{input.label}</Label>
                        <FieldRenderer input={input} handleInputChange={handleInputChange} />
                        {input.description && <p className="text-xs text-muted-foreground mt-1">{input.description}</p>}
                    </div>
                ))}
            </div>

            {nodeData.outputs && nodeData.outputs.length > 0 && (
                <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        <h4 className="font-medium">Outputs</h4>
                        {nodeData.outputs.map((output: any) => (
                            <div key={output.key} className="p-3 border border-border rounded-xl bg-muted/50">
                                <div className="font-bold text-sm">{output.label}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Type: {output.type}</div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {nodeData.meta && Object.keys(nodeData.meta).length > 0 && (
                <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                        <h4 className="font-medium">Configuration</h4>
                        {Object.entries(nodeData.meta).map(([key, value]: [string, any]) => (
                            <div key={key} className="flex items-center justify-between">
                                <Label htmlFor={key} className="text-sm">{key}</Label>
                                <Switch
                                    id={key}
                                    checked={value}
                                    onCheckedChange={(checked) => {
                                        const updatedData = { ...nodeData };
                                        updatedData.meta[key] = checked;
                                        setNodeData(updatedData);
                                        updateNodeData(node.id, updatedData);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Domain-specific sections */}
            {(nodeData.name?.includes('Bot') || node.type === 'processing' || node.type === 'trading_bot') && (
                <AICharacterSection
                    nodeData={nodeData}
                    nodeId={node.id}
                    updateNodeData={updateNodeData}
                    setNodeData={setNodeData}
                />
            )}

            {nodeData.name === 'Crypto Wallet' && (
                <WalletInfoSection outputData={nodeData.outputData} />
            )}

            {nodeData.name === 'Trading Bot' && (
                <TradingAnalysisSection outputData={nodeData.outputData} />
            )}

            {nodeData.name === 'Crypto Trade' && (
                <TradeInfoSection outputData={nodeData.outputData} />
            )}
        </div>
    );
}
