'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

export function DashboardProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            <WorkspaceProvider>
                {children}
            </WorkspaceProvider>
        </QueryClientProvider>
    );
}
