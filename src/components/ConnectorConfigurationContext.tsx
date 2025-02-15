import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useIpsData } from '@/components/IpsDataContext';
import { FhirUrlStreamProcessor } from '@/services/fhir/fhirStreamProcessorUrl';
import { IpsSectionCode } from "@/services/fhir/fhirIpsModels";
import { getProcessor } from "@/services/fhir/ipsResourceProcessor";
import Toast from 'react-native-toast-message';

export interface ConnectorConfigurationContextType {
  isConnectorConfigured: boolean;
  patientId: string | null;
  isLoading: boolean;
  savePatientId: (newPatientId: string) => Promise<void>;
  loadFhirData: (id: string | null) => Promise<any>;
  checkConfiguration: () => Promise<boolean>;
}

export const ConnectorConfigurationContext = createContext<ConnectorConfigurationContextType | null>(null);

export const ConnectorConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const { setIpsData, ipsData } = useIpsData();

  const isConnectorConfigured = Boolean(
    patientId && 
    ipsData && 
    ipsData.resources.length > 0 && 
    ipsData.sections.length > 0
  );

  const processIpsData = (ipsData: any) => {
    // Pre-process and store flattened resources for each section
    Object.values(IpsSectionCode).forEach(({ code, label }) => {
      try {
        const processor = getProcessor(code);
        ipsData.flattenedResources[code] = processor.process(ipsData);
      } catch (error) {
        console.log(`Failed to process "${label}" section:`, error);
        ipsData.flattenedResources[code] = [];
      }
    });
    return ipsData;
  };

  const loadFhirData = async (id: string | null) => {
    if (!id) return null;
    console.log('loadFhirData:', id);
    
    try {
      setIsLoading(true);
      const downloadStartTime = performance.now();
      const url = `https://fhir-static.healthwallet.li/fhir-examples/ips-fhir/${id}-ips.json`;
      const ipsData = await new FhirUrlStreamProcessor().streamData(url);
      const downloadEndTime = performance.now();
      console.log(`FHIR data download took ${(downloadEndTime - downloadStartTime).toFixed(2)}ms`);

      if (ipsData && ipsData.sections.length !== 0 && ipsData.resources.length !== 0) {
        const processStartTime = performance.now();
        const processedIpsData = processIpsData(ipsData);
        const processEndTime = performance.now();
        console.log(`IPS data processing took ${(processEndTime - processStartTime).toFixed(2)}ms`);
        
        setIpsData(processedIpsData);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Patient data loaded successfully",
          position: "bottom",
          visibilityTime: 1000,
        });
        return processedIpsData;
      } else {
        setIpsData(null);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load FHIR data.",
          position: "bottom",
          autoHide: false,
          onPress: () => Toast.hide()
        });
        return null;
      }
    } catch (error) {
      console.error("Error fetching FHIR data:", error);
      setIpsData(null);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load FHIR data.",
        position: "bottom",
        autoHide: false,
        onPress: () => Toast.hide()
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const savePatientId = async (newPatientId: string) => {
    try {
      setIsLoading(true);
      if (newPatientId) {
        await SecureStore.setItemAsync("patientId", newPatientId);
        setPatientId(newPatientId);
        const data = await loadFhirData(newPatientId);
        if (!data) {
          setIpsData(null); // Ensure IPS data is cleared on failure
        }
      } else {
        // Clear everything when empty ID
        await SecureStore.deleteItemAsync("patientId");
        setPatientId(null);
        setIpsData(null);
      }
    } catch (error) {
      console.log("Error saving patient ID:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConfiguration = async () => {
    try {
      const savedPatientId = await SecureStore.getItemAsync("patientId");
      if (savedPatientId) {
        setPatientId(savedPatientId);
        await loadFhirData(savedPatientId);
      }
      return Boolean(savedPatientId);
    } catch (error) {
      console.error("Error checking configuration:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  return (
    <ConnectorConfigurationContext.Provider
      value={{
        isConnectorConfigured,
        patientId,
        isLoading,
        savePatientId,
        loadFhirData,
        checkConfiguration,
      }}
    >
      {children}
    </ConnectorConfigurationContext.Provider>
  );
};

export const useConnectorConfiguration = () => {
  const context = useContext(ConnectorConfigurationContext);
  if (!context) {
    throw new Error('useConnectorConfiguration must be used within a ConnectorConfigurationProvider');
  }
  return context;
};
