'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type UXMode = 'lite' | 'pro';

interface UXModeContextType {
  mode: UXMode;
  isLite: boolean;
  isPro: boolean;
  setMode: (mode: UXMode) => void;
  toggleMode: () => void;
}

const STORAGE_KEY = 'onhandl_ux_mode';

const UXModeContext = createContext<UXModeContextType | undefined>(undefined);

function isUXMode(value: string | null): value is UXMode {
  return value === 'lite' || value === 'pro';
}

export function UXModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<UXMode>('lite');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isUXMode(saved)) {
      setModeState(saved);
    }
  }, []);

  const setMode = useCallback((nextMode: UXMode) => {
    setModeState(nextMode);
    localStorage.setItem(STORAGE_KEY, nextMode);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((currentMode) => {
      const nextMode = currentMode === 'lite' ? 'pro' : 'lite';
      localStorage.setItem(STORAGE_KEY, nextMode);
      return nextMode;
    });
  }, []);

  const value = useMemo(() => ({
    mode,
    isLite: mode === 'lite',
    isPro: mode === 'pro',
    setMode,
    toggleMode,
  }), [mode, setMode, toggleMode]);

  return (
    <UXModeContext.Provider value={value}>
      {children}
    </UXModeContext.Provider>
  );
}

export function useUXMode() {
  const context = useContext(UXModeContext);
  if (context === undefined) {
    throw new Error('useUXMode must be used within a UXModeProvider');
  }
  return context;
}
