import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { initializeHolderCore, ONECore } from "@procivis/react-native-one-core";

interface OneContextType {
  oneCore: ONECore | null;
}

const OneContext = createContext<OneContextType | undefined>(undefined);

export const OneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [oneCore, setOneCore] = useState<ONECore | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function initOne() {
      if (isInitialized) return;
      
      try {
        const holderCore = await initializeHolderCore();
        setOneCore(holderCore);
        setIsInitialized(true);
        console.log('ONE Core initialized successfully');
      } catch (error) {
        console.error('Failed to initialize ONE:', error);
        throw error;
      }
    }
    initOne();
  }, [isInitialized]);

  return (
    <OneContext.Provider value={{ oneCore }}>
      {children}
    </OneContext.Provider>
  );
};

export const useOneCore = (): OneContextType => {
  const context = useContext(OneContext);
  if (!context) {
    throw new Error('useOne must be used within a OneProvider');
  }
  return context;
}; 