import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useIpsData } from '@/components/IpsDataContext';
import { FhirUrlStreamProcessor } from '@/components/fhirStreamProcessorUrl';
import Toast from 'react-native-toast-message';

export interface ConfigurationContextType {
  isConfigured: boolean;
  patientId: string | null;
  isLoading: boolean;
  savePatientId: (newPatientId: string) => Promise<void>;
  loadFhirData: (id: string | null) => Promise<any>;
  checkConfiguration: () => Promise<boolean>;
}

export const ConfigurationContext = createContext<ConfigurationContextType | null>(null);

export const ConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const { setIpsData, ipsData } = useIpsData();

  const isConfigured = Boolean(
    patientId && 
    ipsData && 
    ipsData.resources.length > 0 && 
    ipsData.sections.length > 0
  );

  const loadFhirData = async (id: string | null) => {
    if (!id) return null;
    console.log('loadFhirData:', id);
    
    try {
      setIsLoading(true);
      const url = `https://fhir-static.healthwallet.li/fhir-examples/ips-fhir/${id}-ips.json`;
      const ipsData = await new FhirUrlStreamProcessor().streamData(url);

      if (ipsData && ipsData.sections.length !== 0 && ipsData.resources.length !== 0) {
        setIpsData(ipsData);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Patient data loaded successfully",
          position: "bottom",
        });
        return ipsData;
      } else {
        setIpsData(null);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load FHIR data.",
          position: "bottom",
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
      console.error("Error saving patient ID:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save patient ID.",
        position: "bottom",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkConfiguration = async () => {
    return isConfigured;
  };

  // Initialize configuration once at app start
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const savedPatientId = await SecureStore.getItemAsync("patientId");
        setPatientId(savedPatientId);
        if (savedPatientId && (!ipsData || ipsData.resources.length === 0)) {
          await loadFhirData(savedPatientId);
        }
      } catch (error) {
        console.error('Error initializing configuration:', error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to initialize configuration.",
          position: "bottom",
        });
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  return (
    <ConfigurationContext.Provider 
      value={{
        isConfigured,
        patientId,
        isLoading,
        savePatientId,
        loadFhirData,
        checkConfiguration
      }}
    >
      {children}
    </ConfigurationContext.Provider>
  );
};

export const useConfiguration = () => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};
