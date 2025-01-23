import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useNavigation } from "expo-router";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import * as SecureStore from "expo-secure-store";
import { useClickedTab } from "@/components/clickedTabContext";
import { useIpsData } from "@/components/IpsDataContext";

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

  const { clickedTab, setClickedTab } = useClickedTab();
  const { ipsData } = useIpsData();

  const handleTabPress = async (e: any, routeName: string) => {
    // Call e.preventDefault() immediately to block navigation
    e.preventDefault();

    try {
      setClickedTab(!clickedTab);
      const patientId = await SecureStore.getItemAsync("patientId");
      if (patientId &&ipsData) {
        navigation.navigate(routeName as never);
      }
    } catch (error) {
      console.error("Error fetching patientId:", error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerPressColor: Colors[colorScheme ?? "light"].tint,
        tabBarActiveBackgroundColor: Colors[colorScheme ?? "light"].selected,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarIconStyle: { color: Colors[colorScheme ?? "light"].tint },
        tabBarInactiveBackgroundColor:
          Colors[colorScheme ?? "light"].tabBarBackground,
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
          title: "International",
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
  );
}
