import React, { useEffect, useRef } from "react";
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
import * as SecureStore from "expo-secure-store";
import { useIpsData } from "@/components/IpsDataContext";
import BottomSheet from "@/components/reusable/bottomSheet";
import { useClickedTab } from "@/components/clickedTabContext";

const TabSettingsScreen = () => {
  const router = useRouter();
  const theme = useColorScheme();
  const palette = getPalette(theme === "dark");
  const { ipsData } = useIpsData();
  const navigation = useNavigation();
  const refRBSheet = useRef<any>(null);
  const { clickedTab } = useClickedTab();

  useEffect(() => {
    if (
      !ipsData ||
      ipsData.resources.length === 0 ||
      ipsData.sections.length === 0
    ) {
      refRBSheet?.current.open();
    }
  }, [clickedTab, ipsData,refRBSheet]);

  useEffect(() => {
    const loadPatientId = async () => {
      try {
        const savedPatientId = await SecureStore.getItemAsync("patientId");

        //Condition to navigate directly to home page
        if (
          savedPatientId &&
          ipsData &&
          ipsData.sections.length !== 0 &&
          ipsData.resources.length !== 0
        ) {
          navigation.navigate("ips" as never);
        }
      } catch (error) {
        console.error("Error loading patient ID:", error);
      }
    };
    loadPatientId();
  }, []);

  const menuItems = [
    {
      section: "Settings",
      items: [
        {
          title: "Connectors",
          icon: (
            <AntDesign name="user" size={24} color={palette.primary.dark} />
          ),
          route: "/connectors",
        },
        {
          title: "Wallet",
          icon: (
            <AntDesign name="wallet" size={24} color={palette.primary.dark} />
          ),
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
              style={[
                styles.menuItem,
                ,
                {
                  shadowColor: palette.neutral.black,
                  backgroundColor: palette.neutral.white,
                },
              ]}
              onPress={() => router.push(item.route as Href<string | object>)}
            >
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text style={[styles.menuText, { color: palette.primary.dark }]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <BottomSheet
        ref={refRBSheet}
        title="ID Required"
        description="A valid Patient ID is required to continue."
      />
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
