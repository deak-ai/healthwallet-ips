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
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useIpsData } from "@/components/IpsDataContext";
import { getProcessor } from "@/components/ipsResourceProcessor";
import SectionCard from "@/components/card";
import { useThemeColor } from "@/components/Themed";
import Colors from "@/constants/Colors";

export default function SectionScreen() {
  const route = useRoute();
  const { title } = route.params as { title: string };
  const { code } = route.params as { code: string };
  const { ipsData } = useIpsData();

  const resources = ipsData ? getProcessor(code).process(ipsData) : [];
  const titleColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.dark.text },
    "text"
  );
  const theme = useColorScheme() ?? "light";

  const sectionMainContent = () => {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        <View style={styles.separator} />
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
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
    textAlign: "center",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  scrollViewContainer: {
    flexGrow: 1,
    backgroundColor: "transparent",
  },
  sectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
});
