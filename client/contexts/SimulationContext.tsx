'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SimulationContextType {
  isSimulating: boolean;
  simulationSpeed: number;
  toggleSimulation: () => void;
  setSimulationSpeed: React.Dispatch<React.SetStateAction<number>>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(3000); // Default 3 seconds

  const toggleSimulation = useCallback(() => {
    setIsSimulating((prev) => !prev);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        isSimulating,
        simulationSpeed,
        toggleSimulation,
        setSimulationSpeed,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
