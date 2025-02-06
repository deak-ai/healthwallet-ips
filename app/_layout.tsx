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
import { IpsDataProvider } from "@/components/IpsDataContext";
import { ConfigurationProvider } from "@/components/ConfigurationContext";
import CustomToast from "@/components/reusable/customToast";
import { ClickedTabProvider } from "@/components/clickedTabContext";
import CustomLoader from "@/components/reusable/loader";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useConfiguration } from "@/hooks/useConfiguration";

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
        <IpsDataProvider>
          <ConfigurationProvider>
            <CustomSplashScreen setAppReady={setAppReady} />
          </ConfigurationProvider>
        </IpsDataProvider>
      </RootProviders>
    );
  }

  return (
    <RootProviders>
      <IpsDataProvider>
        <ConfigurationProvider>
          <RootLayoutNav />
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

const CustomSplashScreen = ({
  setAppReady,
  children,
}: {
  setAppReady?: (ready: boolean) => void;
  children?: React.ReactNode;
}) => {
  const { checkConfiguration } = useConfiguration();

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await checkConfiguration();
        if (setAppReady) {
          setAppReady(true);
        }
      } catch (e) {
        console.warn(e);
        if (setAppReady) {
          setAppReady(true); // Still set app as ready even if configuration fails
        }
      }
    };

    prepareApp();
  }, [setAppReady]);

  return (
    <View style={styles.splashContainer}>
      <CustomLoader />
      {children}
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
        <Stack.Screen
          name="shareStepper"
          options={{
            headerShown: false,
          }}
        />
         <Stack.Screen
          name="connectors"
          options={{
            headerShown: false,
          }}
        />
         <Stack.Screen
          name="settingsWallet"
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
  },
});
