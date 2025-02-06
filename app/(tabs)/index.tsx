import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Href, useNavigation, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { getPalette } from "@/constants/Colors";
import { useIpsData } from "@/components/IpsDataContext";
import { useClickedTab } from "@/components/clickedTabContext";
import { useConfiguration } from "@/hooks/useConfiguration";

const TabSettingsScreen = () => {
  const router = useRouter();
  const theme = useColorScheme();
  const palette = getPalette(theme === "dark");
  const { ipsData } = useIpsData();
  const { clickedTab } = useClickedTab();
  const { isConfigured } = useConfiguration();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isConfigured) {
      navigation.navigate('connectors' as never);
    }
  }, [isConfigured, navigation]);

  const menuItems = [
    {
      section: "Settings",
      items: [
        {
          title: "Connectors",
          icon: (
            <AntDesign name="user" size={24} color={palette.text} />
          ),
          route: "connectors",
        },
        {
          title: "Wallet",
          icon: (
            <AntDesign name="wallet" size={24} color={palette.text} />
          ),
          route: "settingsWallet",
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {menuItems.map((section, index) => (
        <View key={index} style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: palette.text }]}>{section.section}</Text>
          {section.items.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.menuItem,
                {
                  shadowColor: palette.neutral.black,
                  backgroundColor: theme === "dark" ? palette.neutral.grey : palette.neutral.white,
                },
              ]}
              onPress={() => navigation.navigate(item.route as never)}
            >
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text style={[styles.menuText, { color: palette.text }]}>
                {item.title}
              </Text>
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
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
  },
});

export default TabSettingsScreen;
