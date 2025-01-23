import React, { createContext, useState, useContext, ReactNode } from "react";
import { IpsData } from "@/components/fhirIpsModels";

interface IpsDataContextType {
  ipsData: IpsData | null;
  setIpsData: (data: IpsData | null) => void;
}

const IpsDataContext = createContext<IpsDataContextType | undefined>(undefined);

export const IpsDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ipsData, setIpsData] = useState<any | null>(null);

  return (
    <IpsDataContext.Provider value={{ ipsData, setIpsData }}>
      {children}
    </IpsDataContext.Provider>
  );
};

export const useIpsData = (): IpsDataContextType => {
  const context = useContext(IpsDataContext);
  if (!context) {
    throw new Error("useFhirData must be used within a FhirDataProvider");
  }
  return context;
};
