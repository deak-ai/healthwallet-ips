import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColorScheme } from "@/components/useColorScheme";
import * as SecureStore from "expo-secure-store";
import { useClickedTab } from "@/components/clickedTabContext";
import { useIpsData } from "@/components/IpsDataContext";
import { getPalette } from "@/constants/Colors";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation(); // Access navigation object
  const isDarkMode=colorScheme==="dark"
  const palette = getPalette(isDarkMode);
  const { clickedTab, setClickedTab } = useClickedTab();
  const { ipsData } = useIpsData();

  const handleTabPress = async (e: any, routeName: string) => {
    // Call e.preventDefault() immediately to block navigation
    e.preventDefault();

    try {
      setClickedTab(!clickedTab);
      const patientId = await SecureStore.getItemAsync("patientId");
      //be sure that we have patient id and a valid ips  data downloaded before move to other tabs
      if (
        patientId &&
        ipsData &&
        ipsData.sections.length !== 0 &&
        ipsData.resources.length !== 0
      ) {
        navigation.navigate(routeName as never);
      }
    } catch (error) {
      console.error("Error fetching patientId:", error);
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
      {/* <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="ambulance" color={color} />
          ),
        }}
      /> */}
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
