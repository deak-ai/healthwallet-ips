import {
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Text,
} from "react-native";
import { View } from "@/components/Themed";
import { IPS_TILES, IpsSectionTile, Tile } from "@/components/IpsSectionTile";
import { useIpsData } from "@/components/IpsDataContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import fhirpath from "fhirpath";
import { AntDesign } from "@expo/vector-icons";
import { getPalette } from "@/constants/Colors";
import { useEffect, useRef, useState } from "react";
import BottomSheet from "@/components/reusable/bottomSheet";
import CustomSwitch from "@/components/reusable/customSwitch";
import * as SecureStore from "expo-secure-store";

/*
These are all the relevant IPS sections with corresponding loinc codes :

Required:
Allergies and Intolerances: 48765-2
Medication Summary: 10160-0
Problem List: 11450-4

Recommended:
History of Procedures: 47519-4
Immunizations: 11369-6
Medical Devices: 46264-8
Results: 30954-2

Optional:
Vital Signs: 8716-3 'pulse-outline', type: 'ionicon'
Past History of Illness: 11348-0
Functional Status: 47420-5
Plan of Care: 18776-5
Social History: 29762-2
Pregnancy History: 10162-6
Advance Directives: 42348-3

Additional:
Alerts: 104605-1
Patient Story: 81338-6
*/

export default function TabIpsScreen() {
  const { ipsData } = useIpsData();
  const router = useRouter();
  const { mode, openId4VpUrl } = useLocalSearchParams<{ mode?: string; openId4VpUrl?: string }>();
  const theme = useColorScheme() ?? "light";
  const isDarkMode = theme === "dark";
  const palette = getPalette(isDarkMode);
  const refRBSheet = useRef<any>(null);
  const [shareMode, setShareMode] = useState(false);
  const [disabledShareMode, setDisabledShareMode] = useState(false);
  
  // Extract codes from ipsData.sections
  const sectionCodes =
    ipsData?.sections?.map((section: any) => section.code.coding[0].code) || [];
  const [selectedElement, setSelectedElement] = useState<
    { code: string; label: string; resourceUris: string[] }[]
  >([]);

  // Filter tiles based on section codes
  const filteredTiles = IPS_TILES.filter((tile) =>
    sectionCodes?.includes(tile.code)
  );

  const patientName = fhirpath.evaluate(
    ipsData?.resources[0]?.resource,
    "Patient.name.where(use='official').given.first()"
  );

  const checkWalletCredentials = async () => {
    const savedUsername = await SecureStore.getItemAsync("username");
    const savedPassword = await SecureStore.getItemAsync("password");
    if (!savedUsername || !savedPassword) {
      setDisabledShareMode(true)
      return false;
    } else {
      setDisabledShareMode(false)
      return true;
    }
  };

  const handleTilePress = (tile: Tile) => {
    if (shareMode || mode === 'openid4vp') {
      setSelectedElement((prevSelectedElements) => {
        const existingElement = prevSelectedElements.find(
          (element) => element.code === tile.code
        );

        if (existingElement) {
          // Remove the existing element
          return prevSelectedElements.filter(
            (element) => element.code !== tile.code
          );
        } else {
          // Add the new object with code and label
          return [
            ...prevSelectedElements,
            { code: tile.code, label: tile.label, resourceUris: [] },
          ];
        }
      });
    } else {
      if (ipsData) {
        router.push({
          pathname: "/section",
          params: {
            code: tile.code,
            title: patientName + " " + tile.label,
            label: tile.label,
          },
        });
      }
    }
  };

  const handleShare = async() => {
    const hasWalletCredentials = await checkWalletCredentials();
    if (selectedElement.length === 0 || !hasWalletCredentials) {
      refRBSheet?.current.open();
    } else {
      if (ipsData) {
        router.push({
          pathname: "/shareStepper",
          params: {
            selectedElement: JSON.stringify(selectedElement),
          },
        });
      }
    }
  };

  const handlePresentation = () => {
    if (selectedElement.length === 0) {
      refRBSheet?.current.open();
      return;
    }

    if (mode === 'openid4vp' && openId4VpUrl) {
      router.push({
        pathname: "/presentationStepper",
        params: {
          selectedElement: JSON.stringify(selectedElement),
          openId4VpUrl
        },
      });
    }
  };


  const handleShareMode = async () => {
    const hasWalletCredentials = await checkWalletCredentials();
    if (!hasWalletCredentials) {
      setDisabledShareMode(true);
      refRBSheet?.current.open();
    } else {
      setShareMode((prev) => !prev);
      setDisabledShareMode(false);
    }
  };

  useEffect(() => {
    const loadWalletCredentials = async () => {
      try {
        const hasWalletCredentials = await checkWalletCredentials();
        if (!hasWalletCredentials) {
          setDisabledShareMode(true);
          setShareMode(false);
        } else {
          setDisabledShareMode(false);
        }
      } catch (error) {
        console.error("Error loading wallet credentials:", error);
      }
    };
    loadWalletCredentials();
  }, []);

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={refRBSheet}
        title={
          disabledShareMode
            ? "Wallet credentials Required"
            : "Selction Required"
        }
        description={
          disabledShareMode
            ? "A valid wallet credentials are required to continue."
            : "Please select at least one section to continue."
        }
      />

      {!mode && (
        <View style={styles.switchContainer}>
          <CustomSwitch
            selectionMode={shareMode ? 1 : 2}
            option1={"Share"}
            option2={"Browse"}
            onSelectSwitch={handleShareMode}
            selectionColor={palette.primary.main}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.tilesContainer}>
        {filteredTiles.map((tile) => (
          <IpsSectionTile
            key={tile.id}
            tile={tile}
            onPress={() => handleTilePress(tile)}
            selected={selectedElement.some((element) => element.code === tile.code)}
          />
        ))}
      </ScrollView>

      {(shareMode || mode === 'openid4vp') && (
        <TouchableOpacity
          style={[
            styles.shareButton,
            {
              backgroundColor: isDarkMode
                ? palette.secondary.main
                : palette.secondary.lighter,
              opacity: selectedElement.length === 0 ? (isDarkMode ? 0.5 : 0.8) : 1,
            },
          ]}
          onPress={mode === 'openid4vp' ? handlePresentation : handleShare}
        >
          <AntDesign
            name="sharealt"
            size={30}
            color={
              selectedElement.length !== 0 || isDarkMode
                ? palette.primary.dark
                : palette.primary.main
            }
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  tilesContainer: {
    padding: 16,
  },
  shareButton: {
    position: "absolute",
    bottom: 45,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  switchContainer: {
    marginTop: 20,
    alignItems: "center",
  },
});
