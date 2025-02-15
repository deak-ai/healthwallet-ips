import React, { createContext, useState, useContext, ReactNode } from "react";
import { IpsData, IpsDataImpl } from "@/services/fhir/fhirIpsModels";

interface IpsDataContextType {
  ipsData: IpsDataImpl | null;
  setIpsData: (data: IpsData | null) => void;
}

const IpsDataContext = createContext<IpsDataContextType | undefined>(undefined);

export const IpsDataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ipsData, setIpsData] = useState<IpsDataImpl | null>(null);

  return (
    <IpsDataContext.Provider value={{ ipsData, setIpsData }}>
      {children}
    </IpsDataContext.Provider>
  );
};

export const useIpsData = (): IpsDataContextType => {
  const context = useContext(IpsDataContext);
  if (!context) {
    throw new Error("useIpsData must be used within a FhirDataProvider");
  }
  return context;
};
