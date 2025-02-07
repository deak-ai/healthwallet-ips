import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import * as SecureStore from "expo-secure-store";
import { useClickedTab } from "@/components/clickedTabContext";
import { useIpsData } from "@/components/IpsDataContext";
import { getPalette } from "@/constants/Colors";
import { useConnectorConfiguration } from "@/components/ConnectorConfigurationContext";
import { useWalletConfiguration } from "@/components/WalletConfigurationContext";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const isDarkMode = colorScheme === "dark";
  const palette = getPalette(isDarkMode);
  const { clickedTab, setClickedTab } = useClickedTab();
  const { ipsData } = useIpsData();
  const { isConnectorConfigured } = useConnectorConfiguration();
  const { isWalletConfigured } = useWalletConfiguration();

  const handleTabPress = async (e: any, routeName: string) => {
    // e.preventDefault();

    // try {
    //   setClickedTab(!clickedTab);
    //   console.log("Configurations (wallet/connector):", isWalletConfigured, isConnectorConfigured)
    //   // Check both configurations
    //   if (!isConnectorConfigured || !isWalletConfigured) {
    //     return;
    //   }

    //   // Only navigate if configured
    //   navigation.navigate(routeName as never);
    // } catch (error) {
    //   console.error("Error in tab navigation:", error);
    // }
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
