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
import { useRoute, useNavigation } from "@react-navigation/native";
import { useIpsData } from "@/components/IpsDataContext";
import {
  filterResourceWrappers,
  getProcessor,
} from "@/components/ipsResourceProcessor";
import SectionCard from "@/components/card";
import { Icon } from "@/components/MultiSourceIcon";
import { getPalette } from "@/constants/Colors";
import { WaltIdIssuerApi } from "@/components/waltIdIssuerApi";
import { WaltIdSmartHealthCardIssuer } from "@/components/waltIdSmartHealthCardIssuer";
import { WaltIdWalletApi } from "@/components/waltIdWalletApi";
import { IpsSectionCode } from "@/components/fhirIpsModels";
import CustomLoader from "@/components/loader";
import Toast from "react-native-toast-message";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function SectionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { title } = route.params as { title: string };
  const { code } = route.params as { code: string };
  const { ipsData } = useIpsData();
  const theme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(false);

  const resources = ipsData ? getProcessor(code).process(ipsData) : [];

  const palette = getPalette(theme === "dark");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleSelect = (code: string) => {
    setSelectedIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(code)) {
        return prevSelectedIds.filter((selectedId) => selectedId !== code);
      } else {
        return [...prevSelectedIds, code];
      }
    });
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      if (ipsData) {
        const resourceWrappers = filterResourceWrappers(
          ipsData,
          IpsSectionCode.Allergies.code
        );
        const patientResourceWrapper = ipsData.resources[0];

        const issuerApi = new WaltIdIssuerApi("https://issuer.healthwallet.li");
        const walletApi = new WaltIdWalletApi(
          "https://wallet.healthwallet.li",
          "user@email.com",
          "password"
        );

        const smartHealthCardIssuer = new WaltIdSmartHealthCardIssuer(
          issuerApi,
          walletApi
        );
        const vc = await smartHealthCardIssuer.issueAndAddToWallet(
          patientResourceWrapper,
          resourceWrappers
        );
        Toast.show({
          type: "success",
          text1: "success",
          text2: "Data shared successfully",
          position: "bottom",
        });
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon
            type="ionicon"
            name="chevron-back-circle-outline"
            size={32}
            color={
              theme === "dark" ? palette.neutral.white : palette.neutral.black
            }
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.sectionContainer}>
          {resources.map((item: any, index) => (
            <SectionCard
              key={index}
              resource={item}
              selected={selectedIds.includes(item.code)}
              onSelect={() => handleSelect(item.code)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        {loading ? (
          <CustomLoader />
        ) : (
          <TouchableOpacity
            style={[
              styles.shareButton,
              { backgroundColor: palette.secondary.light },
            ]}
            onPress={handleShare}
          >
            <AntDesign name="sharealt" size={30} color={palette.primary.dark}/>
          </TouchableOpacity>
        )}
      </View>
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
  shareButtonText: {
    fontWeight: "bold",
  },
});
