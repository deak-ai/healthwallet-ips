import React, { createContext, useState, useContext, ReactNode } from "react";

interface ClickedTabContextType {
  clickedTab: boolean;
  setClickedTab: (value: boolean) => void;
}

interface ClickedTabProviderProps {
  children: ReactNode;
}

const ClickedTabContext = createContext<ClickedTabContextType | undefined>(undefined);

export const ClickedTabProvider: React.FC<ClickedTabProviderProps> = ({ children }) => {
  const [clickedTab, setClickedTabState] = useState<boolean>(false);

  const setClickedTab = (value: boolean) => {
    setClickedTabState(value);
  };

  return (
    <ClickedTabContext.Provider value={{ clickedTab, setClickedTab }}>
      {children}
    </ClickedTabContext.Provider>
  );
};

export const useClickedTab = (): ClickedTabContextType => {
  const context = useContext(ClickedTabContext);
  if (!context) {
    throw new Error("useClickedTab must be used within a ClickedTabProvider");
  }
  return context;
};
