'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Rocket } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { liveModeManager } from '@/lib/deployment/live-mode-manager';
import { OverviewTab } from './live-mode/overview-tab';
import { TelegramTab } from './live-mode/telegram-tab';
import { TradingTab } from './live-mode/trading-tab';

interface LiveModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: string;
  nodes: any[];
}

const LiveModeModal: React.FC<LiveModeModalProps> = ({ isOpen, onClose, flowId, nodes }) => {
  const [isEnabling, setIsEnabling] = useState(false);
  const [status, setStatus] = useState<null | { success: boolean; message: string }>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Extract relevant nodes
  const telegramNodes = nodes.filter(
    (node) => node.type === 'telegram' || node.data.name === 'Telegram Bot'
  );
  const walletNodes = nodes.filter(
    (node) => node.type === 'crypto_wallet' || node.data.name === 'Crypto Wallet'
  );
  const tradeNodes = nodes.filter(
    (node) => node.type === 'crypto_trade' || node.data.name === 'Crypto Trade'
  );

  // Node configuration states
  const [enabledNodes, setEnabledNodes] = useState<Record<string, boolean>>({});
  const [riskLevels, setRiskLevels] = useState<Record<string, 'low' | 'medium' | 'high'>>({});

  // Initialize node states
  useEffect(() => {
    const initialEnabledNodes: Record<string, boolean> = {};
    const initialRiskLevels: Record<string, 'low' | 'medium' | 'high'> = {};

    telegramNodes.forEach((node) => { initialEnabledNodes[node.id] = true; });
    walletNodes.forEach((node) => {
      const hasWalletAddress = node.data.inputs?.some(
        (input: any) => input.key === 'walletAddress' && input.value
      );
      initialEnabledNodes[node.id] = hasWalletAddress;
    });
    tradeNodes.forEach((node) => {
      initialRiskLevels[node.id] = 'low';
      initialEnabledNodes[node.id] = true;
    });

    setEnabledNodes(initialEnabledNodes);
    setRiskLevels(initialRiskLevels);
  }, [telegramNodes, walletNodes, tradeNodes]);

  const toggleNodeEnabled = (nodeId: string) => {
    setEnabledNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const setNodeRiskLevel = (nodeId: string, level: 'low' | 'medium' | 'high') => {
    setRiskLevels((prev) => ({ ...prev, [nodeId]: level }));
  };

  const handleEnableLiveMode = async () => {
    setIsEnabling(true);
    setStatus(null);

    try {
      const config = {
        flowId,
        telegramNodes: telegramNodes.filter(n => enabledNodes[n.id]).map(n => ({
          nodeId: n.id,
          botToken: n.data.inputs?.find((i: any) => i.key === 'botToken')?.value || '',
          chatId: n.data.inputs?.find((i: any) => i.key === 'chatId')?.value || '',
        })),
        walletNodes: walletNodes.filter(n => enabledNodes[n.id]).map(n => ({
          nodeId: n.id,
          walletAddress: n.data.inputs?.find((i: any) => i.key === 'walletAddress')?.value || '',
          network: n.data.inputs?.find((i: any) => i.key === 'network')?.value || 'Ethereum',
        })),
        tradeNodes: tradeNodes.filter(n => enabledNodes[n.id]).map(n => ({
          nodeId: n.id,
          maxAmount: 0.1,
          riskLevel: riskLevels[n.id] || 'low',
        })),
      };

      const result = await liveModeManager.enableLiveMode(config);
      if (result) {
        setStatus({ success: true, message: 'Live mode enabled successfully! Your bot is now running in production.' });
      } else {
        throw new Error('Failed to enable live mode');
      }
    } catch (error: any) {
      setStatus({ success: false, message: `Error enabling live mode: ${error.message}` });
    } finally {
      setIsEnabling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Enable Live Mode</DialogTitle>
          </DialogHeader>
        </VisuallyHidden>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-red-500" />
            Enable Live Mode
          </DialogTitle>
          <DialogDescription>
            Switch from simulation to live mode for real service connection.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab telegramNodes={telegramNodes} walletNodes={walletNodes} tradeNodes={tradeNodes} />
          </TabsContent>

          <TabsContent value="telegram">
            <TelegramTab telegramNodes={telegramNodes} enabledNodes={enabledNodes} toggleNodeEnabled={toggleNodeEnabled} />
          </TabsContent>

          <TabsContent value="trading">
            <TradingTab tradeNodes={tradeNodes} enabledNodes={enabledNodes} toggleNodeEnabled={toggleNodeEnabled} riskLevels={riskLevels} setNodeRiskLevel={setNodeRiskLevel} />
          </TabsContent>
        </Tabs>

        {status && (
          <div className={`p-3 rounded-md ${status.success ? 'bg-green-50 border-green-200 border' : 'bg-red-50 border-red-200 border'} flex items-start gap-2 mt-4`}>
            {status.success ? <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />}
            <p className="text-sm">{status.message}</p>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleEnableLiveMode} disabled={isEnabling} className="bg-red-500 hover:bg-red-600 text-white">
            {isEnabling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enabling...</> : <><Rocket className="h-4 w-4 mr-2" /> Enable Live Mode</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveModeModal;
