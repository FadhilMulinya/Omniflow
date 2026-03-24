'use client';

import { WagmiProvider } from 'wagmi';
import { config } from '@/config/config';
import { WalletProvider } from '@/contexts/wallet-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable automatic refetching on window focus
    },
  },
});

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>{children}</WalletProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Optional: If you need to use the queryClient elsewhere in your app
export { queryClient };
