import { useEffect, useRef } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { IpsDataProvider } from "@/contexts/IpsDataContext";
import { ConnectorConfigurationProvider, useConnectorConfiguration } from "@/contexts/ConnectorConfigurationContext";
import { WalletConfigurationProvider, useWalletConfiguration } from "@/contexts/WalletConfigurationContext";
import CustomToast from "@/components/reusable/customToast";
import { ClickedTabProvider } from "@/contexts/ClickedTabContext";
import CustomLoader from "@/components/reusable/loader";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <RootProviders>
      <IpsDataProvider>
        <ConnectorConfigurationProvider>
          <WalletConfigurationProvider>
            <AppContent />
          </WalletConfigurationProvider>
        </ConnectorConfigurationProvider>
      </IpsDataProvider>
    </RootProviders>
  );
}

const RootProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClickedTabProvider>{children}</ClickedTabProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

function AppContent() {
  const { isConnectorConfigured, isLoading: isConnectorLoading } = useConnectorConfiguration();
  const { isWalletConfigured, isLoading: isWalletLoading } = useWalletConfiguration();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const didInitialNavigate = useRef(false);

  const isLoading = isConnectorLoading || isWalletLoading;

  useEffect(() => {
    if (!isLoading) {
      // Handle both initial navigation and configuration changes
      if (!isConnectorConfigured) {
        console.log("Connector not configured, navigating to /settingsConnectors");
        router.push("/settingsConnectors");
      } else if (!isWalletConfigured) {
        console.log("Wallet not configured, navigating to /settingsWallet");
        router.push("/settingsWallet");
      } else if (!didInitialNavigate.current) {
        // Only navigate to IPS on initial load
        console.log("All good, going to home screen with IPS")
        router.push("/(tabs)/ips");
        didInitialNavigate.current = true;
      }
    }
  }, [isLoading, isConnectorConfigured, isWalletConfigured]);

  if (isLoading && !didInitialNavigate.current) {
    return (<CustomLoader variant="overlay" />)
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settingsConnectors" />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="section" />
          <Stack.Screen name="shareStepper" />
          <Stack.Screen name="presentationStepper" />
          <Stack.Screen name="settingsWallet" />
        </Stack>
      <CustomToast />
    </ThemeProvider>
  );
}
