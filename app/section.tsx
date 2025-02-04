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
import { useRoute } from "@react-navigation/native";
import { useIpsData } from "@/components/IpsDataContext";
import {
  filterResourceWrappers,
  getProcessor,
} from "@/components/ipsResourceProcessor";
import SectionCard from "@/components/card";
import { getPalette } from "@/constants/Colors";
import CustomLoader from "@/components/reusable/loader";
import Toast from "react-native-toast-message";
import AntDesign from "@expo/vector-icons/AntDesign";
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

  const resources = ipsData ? getProcessor(code).process(ipsData) : [];

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "transparent",
      //backgroundColor: theme === 'dark' ? palette.primary.dark : palette.neutral.white,
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
    fixedButtonContainer: {
      position: "absolute",
      bottom: 20,
      left: "50%",
      transform: [{ translateX: -100 }],
      width: 200,
      alignItems: "center",
    },
    shareButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      justifyContent: "center",
      alignItems: "center",
      width: 80,
      height: 80,
      borderRadius: 50,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Header title={title} />
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.sectionContainer}>
            {resources.map((item: any, index) => (
              <SectionCard
                key={index}
                resource={item}
                selected={selectedIds.includes(item.uri)}
                onSelect={() => handleSelect(item.uri)}
                label={label}
              />
            ))}
          </View>
        </ScrollView>

        {loading ? (
          <CustomLoader />
        ) : (
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity
              style={[
                styles.shareButton,
                { backgroundColor: palette.secondary.light },
              ]}
              onPress={handleShare}
            >
              <AntDesign name="sharealt" size={30} color={palette.primary.dark} />
            </TouchableOpacity>
          </View>
        )}
        <StatusBar style={theme === "dark" ? "light" : "auto"} />
      </View>
    </SafeAreaView>
  );
}
