import React from "react";
import { Tabs, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { useColorScheme } from "@/hooks/useColorScheme";
import { useClickedTab } from "@/contexts/ClickedTabContext";
import { getPalette } from "@/constants/Colors";
import { useConnectorConfiguration } from "@/contexts/ConnectorConfigurationContext";
import { useWalletConfiguration } from "@/contexts/WalletConfigurationContext";
import { Icon } from "@/components/MultiSourceIcon";

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
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? palette.primary.dark : palette.neutral.white }}
      edges={["bottom"]}
    >
      <StatusBar 
        style={isDarkMode ? "light" : "dark"}
        backgroundColor="transparent"
        translucent={true}
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: isDarkMode?palette.primary.light :palette.primary.dark,
          headerShown: false,
          headerPressColor: palette.primary.main,
          tabBarInactiveTintColor: palette.primary.main,
          tabBarIconStyle: { color: palette.primary.main },
          tabBarInactiveBackgroundColor:
          isDarkMode?palette.primary.dark: palette.neutral.white,
          tabBarActiveBackgroundColor: isDarkMode?palette.primary.dark: palette.neutral.white,
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
            paddingBottom: 10,
            marginBottom: 8,
            backgroundColor: isDarkMode ? palette.primary.dark : palette.neutral.white
          }
        }}
      >
      <Tabs.Screen
        name="ips"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Icon type="fontawesome5" name="clinic-medical" color={color} size={28} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "ips"),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color }) => <Icon type="fontawesome" name="qrcode" color={color} size={28} />,
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
            <Icon type="ionicons" name="wallet-outline" color={color} size={28} />
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
          tabBarIcon: ({ color }) => <Icon type="materialcommunityicons" name="brain" color={color} size={28} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "agent"),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Icon type="ionicons" name="settings-outline" color={color} size={28} />,
        }}
        listeners={{
          tabPress: (e) => handleTabPress(e, "index"),
        }}
      />
    </Tabs>
    </SafeAreaView>
  );
}