import React, { useState } from "react";
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
import { WaltIdIssuerApi } from "@/components/waltIdIssuerApi";
import { WaltIdSmartHealthCardIssuer } from "@/components/waltIdSmartHealthCardIssuer";
import { WaltIdWalletApi } from "@/components/waltIdWalletApi";
import CustomLoader from "@/components/reusable/loader";
import Toast from "react-native-toast-message";
import AntDesign from "@expo/vector-icons/AntDesign";
import Header from "@/components/reusable/header";
import * as SecureStore from "expo-secure-store";

export default function SectionScreen() {
  const route = useRoute();
  const { title, code, label } = route.params as {
    title: string;
    code: string;
    label: string;
  };
  const { ipsData } = useIpsData();
  const theme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(false);

  const resources = ipsData ? getProcessor(code).process(ipsData) : [];

  const palette = getPalette(theme === "dark");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleSelect = (uri: string) => {
    setSelectedIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(uri)) {
        return prevSelectedIds.filter((selectedId) => selectedId !== uri);
      } else {
        return [...prevSelectedIds, uri];
      }
    });
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      if (ipsData) {
        const resourceWrappers = filterResourceWrappers(ipsData, code);
        const savedUsername = await SecureStore.getItemAsync("username");
        const savedPassword = await SecureStore.getItemAsync("password");

        const issuerApi = new WaltIdIssuerApi("https://issuer.healthwallet.li");
        const walletApi = new WaltIdWalletApi(
          "https://wallet.healthwallet.li",
          savedUsername || "",
          savedPassword || ""
        );

        //test login before sharing
        const loginData = await walletApi.login();
        if (loginData.token) {
          const selectedPatientResourcesWrappers = resourceWrappers.filter(
            (resourceWrapper: any) => {
              return selectedIds.includes(
                resourceWrapper.fullUrl
              );
            }
          );
          const smartHealthCardIssuer = new WaltIdSmartHealthCardIssuer(
            issuerApi,
            walletApi
          );
          const vc = await smartHealthCardIssuer.issueAndAddToWallet(
            "Self-issued " + label,
            ipsData.getPatientResource(),
            selectedPatientResourcesWrappers,
          );
          Toast.show({
            type: "success",
            text1: "success",
            text2: "Data shared successfully",
            position: "bottom",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to login.",
            position: "bottom",
          });
        }
      }
    } catch (error) {
      console.error("Error sharing data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed share data",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
