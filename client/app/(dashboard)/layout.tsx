import type React from 'react';
import Sidebar from '@/components/sidebar';
import { DashboardProviders } from './providers';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProviders>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto pt-12 md:pt-0">{children}</main>
      </div>
    </DashboardProviders>
  );
}
