import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  ScrollView,
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useIpsData } from "@/components/IpsDataContext";
import { getProcessor } from "@/components/ipsResourceProcessor";
import SectionCard from "@/components/card";
import { Icon } from "@/components/MultiSourceIcon";
import { getPalette } from "@/constants/Colors";

export default function SectionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { title } = route.params as { title: string };
  const { code } = route.params as { code: string };
  const { ipsData } = useIpsData();
  const theme = useColorScheme() ?? "light";

  const resources = ipsData ? getProcessor(code).process(ipsData) : [];

  const palette =getPalette(theme==="dark")

  return (
     <View style={[styles.container,{backgroundColor:palette.background}]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon
              type="ionicon"
              name="chevron-back-circle-outline"
              size={32}
              color={theme === "dark" ? palette.neutral.white : palette.neutral.black}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: palette.text}]}>{title}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.sectionContainer}>
            {resources.map((item, index) => (
              <SectionCard key={index} resource={item} />
            ))}
          </View>
        </ScrollView>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingTop: 20,
  },
  sectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
});
