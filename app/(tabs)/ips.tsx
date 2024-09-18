import { StyleSheet, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { IpsSectionTile, Tile } from '@/components/IpsSectionTile';


export default function TabIpsScreen() {

  const tiles: Tile[] = [
    { id: 1, label: 'Allergies', icon: 'medkit-outline', type: 'ionicon'},
    { id: 2, label: 'Medications', icon: 'pills', type: 'fontawesome6'},
    { id: 3, label: 'Immunizations', icon: 'shield-checkmark-outline', type: 'ionicon'},
    { id: 4, label: 'Procedures', icon: 'bandage-outline', type: 'ionicon'},
    { id: 5, label: 'Conditions', icon: 'list-outline', type: 'ionicon'},
    { id: 6, label: 'Vitals', icon: 'pulse-outline', type: 'ionicon'},
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Patient Summary</Text>
      <View style={styles.tilesContainer}>
        {tiles.map((tile) => (
            <IpsSectionTile key={tile.id} onPress={() => alert(`${tile.label} pressed!`)} tile={tile}/>
        ))}
      </View>
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
