import { useEffect, useRef } from "react";
import { useColorScheme } from "@/components/useColorScheme";
import { IpsDataProvider } from "@/components/IpsDataContext";
import { ConnectorConfigurationProvider, useConnectorConfiguration } from "@/components/ConnectorConfigurationContext";
import { WalletConfigurationProvider, useWalletConfiguration } from "@/components/WalletConfigurationContext";
import CustomToast from "@/components/reusable/customToast";
import { ClickedTabProvider } from "@/components/clickedTabContext";
import CustomLoader from "@/components/reusable/loader";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';

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
        console.log("Connector not configured, navigating to /connectors");
        router.push("/connectors");
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
    // return (
    //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === "dark" ? "#000" : "#fff" }}>
    //     <ActivityIndicator size="large" color={colorScheme === "dark" ? "#fff" : "#000"} />
    //   </View>
    // );

    return (<CustomLoader variant="overlay" />)
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="connectors" />
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
