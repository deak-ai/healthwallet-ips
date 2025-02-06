import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useContext, useRef } from "react";
import { View, StyleSheet } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { IpsDataProvider } from "@/components/IpsDataContext";
import { ConfigurationProvider, ConfigurationContext, useConfiguration } from "@/components/ConfigurationContext";
import CustomToast from "@/components/reusable/customToast";
import { ClickedTabProvider } from "@/components/clickedTabContext";
import CustomLoader from "@/components/reusable/loader";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "connectors",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore error here since the app is already visible
      });
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <RootProviders>
        <View style={styles.splashContainer}>
          <CustomLoader variant="initial" />
        </View>
      </RootProviders>
    );
  }

  return (
    <RootProviders>
      <IpsDataProvider>
        <ConfigurationProvider>
          <AppContent />
        </ConfigurationProvider>
      </IpsDataProvider>
    </RootProviders>
  );
}

const RootProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaProvider>
      <ClickedTabProvider>{children}</ClickedTabProvider>
    </SafeAreaProvider>
  );
};

function AppContent() {
  const { isConfigured, isLoading } = useConfiguration();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const didInitialNavigate = useRef(false);

  useEffect(() => {
    // Only navigate once after initial loading
    if (!didInitialNavigate.current && !isLoading) {
      didInitialNavigate.current = true;
      if (isConfigured) {
        router.push("/(tabs)/ips");
      } else {
        router.push("/connectors");
      }
    }
  }, [isLoading, isConfigured]);

  // Handle configuration changes after initial navigation
  useEffect(() => {
    if (!isLoading && didInitialNavigate.current) {
      if (!isConfigured) {
        router.push("/connectors");
      }
    }
  }, [isConfigured, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <CustomLoader variant="initial" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="connectors" />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="section" />
        <Stack.Screen name="shareStepper" />
        <Stack.Screen name="settingsWallet" />
      </Stack>
      <CustomToast />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
