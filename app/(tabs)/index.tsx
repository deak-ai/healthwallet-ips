import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Href, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getPalette } from "@/constants/Colors";

const TabSettingsScreen = () => {
  const router = useRouter();
  const theme = useColorScheme();
  const palette = getPalette(theme === "dark");

  const menuItems = [
    {
      section: "Settings",
      items: [
        {
          title: "Connectors",
          icon: <AntDesign name="user" size={24} color={palette.primary.dark} />,
          route: "/connectors",
        },
        {
          title: "Wallet",
          icon: <AntDesign name="wallet" size={24} color={palette.primary.dark}/>,
          route: "/settingsWallet",
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((section, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.menuItem,,{shadowColor:palette.neutral.black,backgroundColor:palette.neutral.white}]}
              onPress={() => router.push(item.route as Href<string | object>)}
            >
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text style={[styles.menuText,{color:palette.primary.dark}]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    marginTop: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default TabSettingsScreen;
