import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  ScrollView,
  ImageBackground,
  View,
  Text,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useIpsData } from "@/components/IpsDataContext";
import { getProcessor } from "@/components/ipsResourceProcessor";
import SectionCard from "@/components/card";
import { useThemeColor } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Icon } from "@/components/MultiSourceIcon";

export default function SectionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { title } = route.params as { title: string };
  const { code } = route.params as { code: string };
  const { ipsData } = useIpsData();
  const theme = useColorScheme() ?? "light";

  const resources = ipsData ? getProcessor(code).process(ipsData) : [];
  const titleColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );

  const sectionMainContent = () => {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon
              type="ionicon"
              name="chevron-back-circle-outline"
              size={32}
              color={theme === "dark" ? "#fff" : "#000"}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
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
  };

  return (
    <View style={styles.root}>
      {theme === "dark" ? (
        sectionMainContent()
      ) : (
        <ImageBackground
          source={require("../assets/images/bg.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {sectionMainContent()}
        </ImageBackground>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: "transparent",
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
    backgroundColor: "transparent",
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
