'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';

interface Workspace {
  _id: string;
  name: string;
  ownerId: string;
  // Add other properties as needed
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspaceId: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/workspaces');
      setWorkspaces(data);

      const savedId = localStorage.getItem('active_workspace_id');
      let current = data.find((w: Workspace) => w._id === savedId);

      if (!current && data.length > 0) {
        current = data[0];
        localStorage.setItem('active_workspace_id', current._id);
      }
      setActiveWorkspace(current || null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workspaces');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const setActiveWorkspaceId = useCallback((id: string) => {
    const ws = workspaces.find((w) => w._id === id);
    if (ws) {
      setActiveWorkspace(ws);
      localStorage.setItem('active_workspace_id', id);
      // Trigger a page refresh or handled by components since state changed
    }
  }, [workspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspaceId,
        isLoading,
        error,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
