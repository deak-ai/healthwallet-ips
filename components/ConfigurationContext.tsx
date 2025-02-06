import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useIpsData } from '@/components/IpsDataContext';
import { FhirUrlStreamProcessor } from '@/components/fhirStreamProcessorUrl';
import Toast from 'react-native-toast-message';

interface ConfigurationContextType {
  isConfigured: boolean;
  patientId: string | null;
  isLoading: boolean;
  savePatientId: (newPatientId: string) => Promise<void>;
  loadFhirData: (id: string | null) => Promise<any>;
  checkConfiguration: () => Promise<boolean>;
}

const ConfigurationContext = createContext<ConfigurationContextType | null>(null);

export const ConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
      setIpsData(ipsData);

      if (ipsData && ipsData.sections.length !== 0 && ipsData.resources.length !== 0) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Patient data loaded successfully",
          position: "bottom",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load FHIR data.",
          position: "bottom",
        });
      }
      return ipsData;
    } catch (error) {
      console.error("Error fetching FHIR data:", error);
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
      await SecureStore.setItemAsync("patientId", newPatientId);
      setPatientId(newPatientId);
      await loadFhirData(newPatientId);
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
        if (savedPatientId) {
          setPatientId(savedPatientId);
          if (!ipsData || ipsData.resources.length === 0) {
            await loadFhirData(savedPatientId);
          }
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
