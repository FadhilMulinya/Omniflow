'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi';

interface WalletContextType {
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  isMetaMaskAvailable: boolean;
  connectMetaMask: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { connector, address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const [balance, setBalance] = useState<string | null>(null);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address: address,
    query: { enabled: !!address },
  });

  // Enhanced MetaMask detection
  useEffect(() => {
    const checkAvailability = () => {
      const ethereum = window.ethereum;
      const isInjected =
        !!ethereum?.isMetaMask || ethereum?.providers?.some((p: any) => p.isMetaMask);
      const hasConnector = connectors.some(
        (c: any) => c.id === 'metaMask' || (c.id === 'injected' && isInjected)
      );

      setIsMetaMaskAvailable(!!isInjected || hasConnector);
    };

    checkAvailability();

    // Handle cases where MetaMask is installed after page load
    const handleEthereum = () => {
      checkAvailability();
      window.ethereum?.on('chainChanged', checkAvailability);
      window.ethereum?.on('accountsChanged', checkAvailability);
      return () => {
        window.ethereum?.removeListener('chainChanged', checkAvailability);
        window.ethereum?.removeListener('accountsChanged', checkAvailability);
      };
    };

    if (typeof window !== 'undefined') {
      if (window.ethereum) {
        handleEthereum();
      } else {
        window.addEventListener('ethereum#initialized', handleEthereum, {
          once: true,
        });
      }
    }
  }, [connectors]);

  // Balance effect remains the same
  useEffect(() => {
    setBalance(address && isConnected ? balanceData?.formatted || null : null);
  }, [address, chainId, isConnected, balanceData]);

  const connectMetaMask = async () => {
    try {
      // Try official connector first
      const officialConnector = connectors.find((c) => c.id === 'metaMask');
      if (officialConnector) {
        return connect({ connector: officialConnector });
      }

      // Fallback to injected connector
      const injectedConnector = connectors.find((c) => c.id === 'injected');
      if (injectedConnector && window.ethereum?.isMetaMask) {
        return connect({ connector: injectedConnector });
      }

      // Final fallback to direct access
      if (window.ethereum?.isMetaMask) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        return;
      }

      throw new Error('MetaMask not detected');
    } catch (error) {
      console.error('Connection error:', error);
      // Consider showing a user-friendly error message
    }
  };

  const disconnectWallet = () => disconnect();

  const refreshBalance = async () => {
    const { data } = await refetchBalance();
    const formatted = data?.formatted || '0';
    setBalance(formatted);
    return formatted;
  };

  const value = {
    isConnected,
    isConnecting,
    account: address || null,
    chainId,
    balance,
    isMetaMaskAvailable,
    connectMetaMask,
    disconnectWallet,
    refreshBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
