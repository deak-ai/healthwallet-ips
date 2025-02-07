import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useIpsData } from '@/components/IpsDataContext';
import { FhirUrlStreamProcessor } from '@/components/fhirStreamProcessorUrl';
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
          visibilityTime: 1000,
        });
        return ipsData;
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
