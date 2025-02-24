import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  ScrollView,
  View,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useIpsData } from "@/contexts/IpsDataContext";
import SectionCard from "@/components/SectionCard";
import { getPalette } from "@/constants/Colors";
import CustomLoader from "@/components/reusable/loader";
import Toast from "react-native-toast-message";
import Header from "@/components/reusable/header";
import { useResourceSelection } from "@/hooks/useResourceSelection";
import { useWalletShare } from "@/hooks/useWalletShare";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SectionScreen() {
  const route = useRoute();
  const { title, code, label } = route.params as {
    title: string;
    code: string;
    label: string;
  };
  const { ipsData } = useIpsData();
  const theme = useColorScheme();
  const palette = getPalette(theme === "dark");

  const { selectedIds, handleSelect } = useResourceSelection(ipsData, code);
  const { loading, shareToWallet } = useWalletShare();

  const handleShare = async () => {
    if (!ipsData || selectedIds.length === 0) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select at least one item to share",
        position: "bottom",
      });
      return;
    }
    await shareToWallet(ipsData, code, label, selectedIds);
  };

  const flattenedResources = ipsData ? ipsData.flattenedResources[code] || [] : [];

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "transparent",
    },
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Header title={title} />
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.sectionContainer}>
            {flattenedResources.map((resource) => (
              <SectionCard
                key={resource.uri}
                flattenedResource={resource}
                selected={selectedIds.includes(resource.uri)}
                onSelect={() => handleSelect(resource.uri)}
                label={label}
              />
            ))}
          </View>
        </ScrollView>

        {loading && <CustomLoader />}
        <StatusBar style={theme === "dark" ? "light" : "auto"} />
      </View>
    </SafeAreaView>
  );
}
