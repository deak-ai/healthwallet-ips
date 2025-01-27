import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { IpsDataProvider, useIpsData } from "@/components/IpsDataContext";
import CustomToast from "@/components/customToast";
import { ClickedTabProvider } from "@/components/clickedTabContext";
import CustomLoader from "@/components/loader";
import { FhirUrlStreamProcessor } from "@/components/fhirStreamProcessorUrl";
import * as SecureStore from "expo-secure-store";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
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

  const [appReady, setAppReady] = useState(false);
  
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && appReady) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore error here since the app is already visible
      });
    }
  }, [loaded, appReady]);

  if (!loaded || !appReady) {
    return (
      <RootProviders>
        <CustomSplashScreen setAppReady={setAppReady} />
      </RootProviders>
    );
  }

  return (
    <RootProviders>
      <RootLayoutNav />
    </RootProviders>
  );
}

const RootProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <IpsDataProvider>
      <ClickedTabProvider>{children}</ClickedTabProvider>
    </IpsDataProvider>
  );
};

const CustomSplashScreen = ({
  setAppReady,
}: {
  setAppReady: (ready: boolean) => void;
}) => {
  const { setIpsData } = useIpsData();
  const loadFhirData = async (id: string | null) => {
    try {
      if (id) {
        const url = `https://fhir-static.healthwallet.li/fhir-examples/ips-fhir/${id}-ips.json`;
        const ipsData = await new FhirUrlStreamProcessor().streamData(url);

        setIpsData(ipsData);
      }
    } catch (error) {
      console.error("Error fetching FHIR data:", error);
    }
  };

  useEffect(() => {
    const prepareApp = async () => {
      try {
        const savedPatientId = await SecureStore.getItemAsync("patientId");
        await loadFhirData(savedPatientId);
        setAppReady(true);
      } catch (e) {
        console.warn(e);
      }
    };

    prepareApp();
  }, [setAppReady]);

  return (
    <View style={styles.splashContainer}>
      <CustomLoader />
    </View>
  );
};

const RootLayoutNav = () => {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="section"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <CustomToast />
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
  },
});
