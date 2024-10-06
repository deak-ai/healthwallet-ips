import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { IpsSectionTile, Tile } from '@/components/IpsSectionTile';
import { useIpsData } from '@/components/IpsDataContext';
import { useRouter } from 'expo-router';

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
  const tiles: Tile[] = [
    { id: 1, label: 'Allergies', icon: 'allergies', type: 'fontawesome5', code: '48765-2'},
    { id: 2, label: 'Medications', icon: 'pills', type: 'fontawesome6', code: '10160-0'},
    { id: 3, label: 'Problems', icon: 'report-problem', type: 'materialicons', code: '11450-4'},

    { id: 4, label: 'Procedures', icon: 'bandage-outline', type: 'ionicon', code: '47519-4'},
    { id: 5, label: 'Immunizations', icon: 'shield-checkmark-outline', type: 'ionicon', code: '11369-6'},
    { id: 6, label: 'Results', icon: 'list-outline', type: 'ionicon', code: '30954-2'},
    { id: 7, label: 'Devices', icon: 'devices-other', type: 'materialicons', code: '46264-8'},
  ];


  // Extract codes from ipsData.sections
  const sectionCodes = ipsData?.sections.map(section => section.code.coding[0].code) || [];

  // Filter tiles based on section codes
  const filteredTiles = tiles.filter(tile => sectionCodes.includes(tile.code));

  const handleTilePress = (tile: Tile) => {
    const sectionData = ipsData?.sections.find(section => section.code.coding[0].code === tile.code);
    if (sectionData) {
      router.push({
        pathname: '/modal',
        params: {
          fhirData: JSON.stringify(sectionData, null, 2),
          title: tile.label
        }
      });
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Patient Summary</Text>
        <ScrollView contentContainerStyle={styles.tilesContainer}>
          {filteredTiles.map(tile => (
              <IpsSectionTile key={tile.id} tile={tile} onPress={() => handleTilePress(tile)} />
          ))}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
