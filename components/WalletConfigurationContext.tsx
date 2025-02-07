import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { WaltIdWalletApi } from '@/components/waltIdWalletApi';
import { WaltIdIssuerApi } from '@/components/waltIdIssuerApi';
import { WaltIdSmartHealthCardIssuer } from '@/components/waltIdSmartHealthCardIssuer';

export interface WalletConfigurationContextType {
  isWalletConfigured: boolean;
  isLoading: boolean;
  username: string | null;
  password: string | null;
  walletApi: WaltIdWalletApi | null;
  smartHealthCardIssuer: WaltIdSmartHealthCardIssuer | null;
  saveWalletCredentials: (username: string, password: string) => Promise<void>;
  testWalletConnection: (overrideUsername?: string, overridePassword?: string) => Promise<boolean>;
  checkConfiguration: () => Promise<boolean>;
}

export const WalletConfigurationContext = createContext<WalletConfigurationContextType | null>(null);

export const WalletConfigurationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletConfigured, setIsWalletConfigured] = useState(false);
  const walletApiRef = useRef<WaltIdWalletApi | null>(null);
  const smartHealthCardIssuerRef = useRef<WaltIdSmartHealthCardIssuer | null>(null);

  const initializeWalletApi = (testUsername: string, testPassword: string) => {
    walletApiRef.current = new WaltIdWalletApi(
      "https://wallet.healthwallet.li",
      testUsername,
      testPassword
    );
    const issuerApi = new WaltIdIssuerApi("https://issuer.healthwallet.li");
    smartHealthCardIssuerRef.current = new WaltIdSmartHealthCardIssuer(
      issuerApi,
      walletApiRef.current
    );
    return walletApiRef.current;
  };

  const testWalletConnection = async (overrideUsername?: string, overridePassword?: string) => {
    const testUsername = overrideUsername || username;
    const testPassword = overridePassword || password;
    
    if (!testUsername || !testPassword) {
      console.log("No username or password, so can't test connection");
      return false;
    }

    try {
      setIsLoading(true);
      const walletApi = initializeWalletApi(testUsername, testPassword);
      const data = await walletApi.login();
      const isValid = Boolean(data.token);
      setIsWalletConfigured(isValid);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Wallet credentials are valid",
        position: "bottom",
        visibilityTime: 1000,
      });
      return isValid;
    } catch (error) {
      console.log("Error testing wallet connection:", error);
      walletApiRef.current = null;
      smartHealthCardIssuerRef.current = null;
      setIsWalletConfigured(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Invalid wallet credentials",
        position: "bottom",
        autoHide: false,
        onPress: () => Toast.hide()
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const saveWalletCredentials = async (newUsername: string, newPassword: string) => {
    try {
      setIsLoading(true);
      if (newUsername && newPassword) {
        const isValid = await testWalletConnection(newUsername, newPassword);
        // we still save any values, but handle invalid later
        await SecureStore.setItemAsync("username", newUsername);
        await SecureStore.setItemAsync("password", newPassword);
        setUsername(newUsername);
        setPassword(newPassword);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }
      } else {
        setIsWalletConfigured(false);
      }
    } catch (error) {
      console.log("Error validating wallet credentials:", error);
      setIsWalletConfigured(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConfiguration = async () => {
    try {
      setIsLoading(true);
      const savedUsername = await SecureStore.getItemAsync("username");
      const savedPassword = await SecureStore.getItemAsync("password");

      if (savedUsername && savedPassword) {
        console.log("Found username and password, testing connection");
        setUsername(savedUsername);
        setPassword(savedPassword);
        // Pass the values directly to testWalletConnection instead of waiting for state
        return await testWalletConnection(savedUsername, savedPassword);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  return (
    <WalletConfigurationContext.Provider
      value={{
        isWalletConfigured,
        isLoading,
        username,
        password,
        walletApi: walletApiRef.current,
        smartHealthCardIssuer: smartHealthCardIssuerRef.current,
        saveWalletCredentials,
        testWalletConnection,
        checkConfiguration,
      }}
    >
      {children}
    </WalletConfigurationContext.Provider>
  );
};

export const useWalletConfiguration = () => {
  const context = useContext(WalletConfigurationContext);
  if (!context) {
    throw new Error("useWalletConfiguration must be used within a WalletConfigurationProvider");
  }
  return context;
};
