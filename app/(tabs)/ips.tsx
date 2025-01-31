import {
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { View } from "@/components/Themed";
import { IPS_TILES, IpsSectionTile, Tile } from "@/components/IpsSectionTile";
import { useIpsData } from "@/components/IpsDataContext";
import { useRouter } from "expo-router";
import fhirpath from "fhirpath";
import { getProcessor } from "@/components/ipsResourceProcessor";
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
  const theme = useColorScheme() ?? "light";
  const isDarkMode = theme === "dark";
  const palette = getPalette(isDarkMode);
  const refRBSheet = useRef<any>(null);
  const [clickedShare, setClickedShare] = useState(false);
  const [shareMode, setShareMode] = useState(false);
  const [disabledShareMode, setDisabledShareMode] = useState(false);
  // Extract codes from ipsData.sections
  const sectionCodes =
    ipsData?.sections?.map((section: any) => section.code.coding[0].code) || [];
  const [selectedElement, setSelectedElement] = useState<
    { code: string; label: string; sectionCodes: string[] }[]
  >([]);

  // Filter tiles based on section codes
  const filteredTiles = IPS_TILES.filter((tile) =>
    sectionCodes?.includes(tile.code)
  );

  const patientName = fhirpath.evaluate(
    ipsData?.resources[0]?.resource,
    "Patient.name.where(use='official').given.first()"
  );

  const handleTilePress = (tile: Tile) => {
    if (shareMode) {
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
          // Add the new object with code and sectionCodes
          return [
            ...prevSelectedElements,
            { code: tile.code, label: tile.label, sectionCodes: [] },
          ];
        }
      });
    } else {
      if (ipsData) {
        let names = getProcessor(tile.code)
          .process(ipsData)
          .map((fr) => fr.name as string);
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

    /*
        if (ipsData) {
      router.push({
        pathname: '/modal',
        params: {
          fhirData: yaml.dump(getProcessor(tile.code).process(ipsData)),
          title: patientName + " " + tile.label
        }
      });
    }
     */
  };

  const handleShare = () => {
    if (disabledShareMode) {
      setClickedShare(true);
    }
    if (selectedElement.length === 0) {
      setClickedShare(true);
    } else {
      setClickedShare(false);
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

  const handleShareMode = async () => {
    if (shareMode) {
      setSelectedElement([]);
    } else {
      const savedUsername = await SecureStore.getItemAsync("username");
      const savedPassword = await SecureStore.getItemAsync("password");
      if (!savedUsername || !savedPassword) {
        setDisabledShareMode(true);
        refRBSheet?.current.open();
      } else {
        setShareMode((prev) => !prev);
        setDisabledShareMode(false);
      }
    }
  };

  useEffect(() => {
    const loadWalletCredentials = async () => {
      try {
        const savedUsername = await SecureStore.getItemAsync("username");
        const savedPassword = await SecureStore.getItemAsync("password");
        if (!savedUsername || !savedPassword) {
          setDisabledShareMode(true);
          setShareMode(false);
        } else {
          setDisabledShareMode(true);
        }
      } catch (error) {
        console.error("Error loading wallet credentials:", error);
      }
    };
    loadWalletCredentials();
  }, []);

  useEffect(() => {
    if (clickedShare && shareMode && selectedElement.length === 0) {
      refRBSheet?.current.open();
      setClickedShare(false);
    }
  }, [clickedShare, selectedElement, shareMode]);

  return (
    <View style={styles.container}>
      <BottomSheet
        ref={refRBSheet}
        title={
          disabledShareMode
            ? "Wallet credentials Required"
            : "Resources Required"
        }
        description={
          disabledShareMode
            ? "A valid wallet credentials are required to continue."
            : "Please select which resources to share"
        }
      />

      <View style={styles.switchContainer}>
        <CustomSwitch
          selectionMode={shareMode ? 1 : 2}
          option1={"Share"}
          option2={"Browse"}
          onSelectSwitch={handleShareMode}
          selectionColor={palette.primary.main}
        />
      </View>

      <ScrollView contentContainerStyle={styles.tilesContainer}>
        {filteredTiles.map((tile) => (
          <IpsSectionTile
            key={tile.id}
            tile={tile}
            onPress={() => handleTilePress(tile)}
            selected={
              selectedElement.findIndex(
                (element) => element.code === tile.code
              ) !== -1
            }
          />
        ))}
      </ScrollView>
      <View style={styles.shareContainer}>
        {shareMode && (
          <TouchableOpacity
            style={[
              styles.shareButton,
              {
                backgroundColor: isDarkMode
                  ? palette.secondary.main
                  : palette.secondary.lighter,
                opacity: isDarkMode && selectedElement.length === 0 ? 0.5 : 1,
              },
            ]}
            onPress={handleShare}
          >
            <AntDesign
              name="sharealt"
              size={30}
              color={
                selectedElement.length !== 0
                  ? isDarkMode
                    ? palette.primary.light
                    : palette.primary.dark
                  : palette.primary.light
              }
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 25,
    textAlign: "center",
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 500,
    textAlign: "center",
  },
  tilesContainer: {
    padding: 16,
  },
  shareContainer: {
    position: "absolute",
    bottom: 45,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  shareButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 50,
    position: "absolute",
    left: "50%",
  },
  sheetContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
  infoTitle: {
    fontSize: 18,
    marginLeft: 10,
  },
  infoDescription: { fontWeight: 700 },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginRight: 10,
  },
});
