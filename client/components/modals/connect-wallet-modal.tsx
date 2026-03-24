'use client';

import type React from 'react';

import { useState } from 'react';
import { useWallet } from '@/contexts/wallet-provider';
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Wallet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (walletInfo: any) => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { isMetaMaskAvailable, connectMetaMask, account, balance, chainId } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectMetaMask = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('Connecting to MetaMask...');
      // Check if MetaMask is available
      await connectMetaMask();

      // Create wallet info object to pass back
      const networkName = getNetworkName(chainId);
      const walletInfo = {
        address: account,
        network: networkName,
        chainId,
        balance,
        currency:
          networkName === 'Binance Smart Chain'
            ? 'BNB'
            : networkName === 'Polygon'
              ? 'MATIC'
              : networkName === 'Solana'
                ? 'SOL'
                : 'ETH',
        connectionType: 'MetaMask',
        lastUpdated: new Date().toISOString(),
      };

      onSuccess(walletInfo);
      onClose();
    } catch (err: any) {
      console.error('MetaMask connection error:', err);
      setError(err.message || 'Failed to connect to MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  // Helper to get network name from chain ID
  const getNetworkName = (chainId: number | null): string => {
    if (!chainId) return 'Unknown';

    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 56:
        return 'Binance Smart Chain';
      case 137:
        return 'Polygon';
      default:
        return 'Ethereum';
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Connect your cryptocurrency wallet to interact with the blockchain.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {!isMetaMaskAvailable ? (
            <div className="flex flex-col items-center justify-center p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-center text-sm">
                MetaMask is not installed. Please install the MetaMask extension to continue.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
              >
                Install MetaMask
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                className="w-full flex items-center justify-center gap-2 h-12"
                onClick={handleConnectMetaMask}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Wallet className="h-5 w-5" />
                )}
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </Button>

              {error && (
                <div className="p-3 border border-red-200 bg-red-50 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {account && (
                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Connected</span>
                  </div>
                  <p className="text-sm mb-1">
                    <span className="font-medium">Address:</span> {account.substring(0, 8)}...
                    {account.substring(account.length - 6)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Balance:</span> {balance} ETH
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectWalletModal;
