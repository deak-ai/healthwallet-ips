import {
  StyleSheet,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { IPS_TILES, IpsSectionTile, Tile } from "@/components/IpsSectionTile";
import { useIpsData } from "@/components/IpsDataContext";
import { useRouter } from "expo-router";
import fhirpath from "fhirpath";
import { getProcessor } from "@/components/ipsResourceProcessor";

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

  // Extract codes from ipsData.sections
  const sectionCodes =
    ipsData?.sections?.map((section: any) => section.code.coding[0].code) || [];

  // Filter tiles based on section codes
  const filteredTiles = IPS_TILES.filter((tile) =>
    sectionCodes?.includes(tile.code)
  );

  const patientName = fhirpath.evaluate(
    ipsData?.resources[0]?.resource,
    "Patient.name.where(use='official').given.first()"
  );

  const handleTilePress = (tile: Tile) => {
    if (ipsData) {
      let names = getProcessor(tile.code)
        .process(ipsData)
        .map((fr) => fr.name as string);
      router.push({
        pathname: "/section",
        params: {
          code: tile.code,
          title: patientName + " " + tile.label,
        },
      });
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Summary</Text>
      <ScrollView contentContainerStyle={styles.tilesContainer}>
        {filteredTiles.map((tile) => (
          <IpsSectionTile
            key={tile.id}
            tile={tile}
            onPress={() => handleTilePress(tile)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 25,textAlign:"center"
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 500,
    textAlign:"center"
  },
  tilesContainer: {
    padding: 16,
  },
});
