import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/useColorScheme";
import * as SecureStore from "expo-secure-store";
import { useClickedTab } from "@/components/clickedTabContext";
import { useIpsData } from "@/contexts/IpsDataContext";
import { getPalette } from "@/constants/Colors";
import { useConnectorConfiguration } from "@/contexts/ConnectorConfigurationContext";
import { useWalletConfiguration } from "@/contexts/WalletConfigurationContext";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const isDarkMode = colorScheme === "dark";
  const palette = getPalette(isDarkMode);
  const { clickedTab, setClickedTab } = useClickedTab();
  const { isConnectorConfigured } = useConnectorConfiguration();
  const { isWalletConfigured } = useWalletConfiguration();

  const handleTabPress = async (e: any, routeName: string) => {
    e.preventDefault();

    try {
      setClickedTab(!clickedTab);
      // Check both configurations
      if (!isConnectorConfigured || !isWalletConfigured) {
        // Let the root layout handle the navigation
        return;
      }

      // Only navigate if configured
      switch (routeName) {
        case "ips":
          router.push("/(tabs)/ips");
          break;
        case "scanner":
          router.push("/(tabs)/scanner");
          break;
        case "wallet":
          router.push("/(tabs)/wallet");
          break;
        case "agent":
          router.push("/(tabs)/agent");
          break;
        case "index":
          router.push("/");
          break;
      }
    } catch (error) {
      console.error("Error in tab navigation:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isDarkMode?palette.primary.light :palette.primary.dark,
          headerShown: false,
          headerPressColor: palette.primary.main,
          tabBarInactiveTintColor: palette.primary.main,
          tabBarIconStyle: { color:  palette.primary.main},
          tabBarInactiveBackgroundColor:
          isDarkMode?palette.primary.dark: palette.neutral.white,
          tabBarActiveBackgroundColor: isDarkMode?palette.primary.dark: palette.neutral.white,
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          }
        }}
      >
      <Tabs.Screen
        name="ips"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="medkit" color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "ips"),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => <TabBarIcon name="qrcode" color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "scanner"),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-bag" color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "wallet"),
        }}
      />
      <Tabs.Screen
        name="agent"
        options={{
          title: "Agent",
          tabBarIcon: ({ color }) => <TabBarIcon name="music" color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "agent"),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "index"),
        }}
      />
    </Tabs>
    </SafeAreaView>
  );
}
