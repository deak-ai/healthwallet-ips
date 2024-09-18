import { StyleSheet, Pressable } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import  Icon  from '@/components/MultiSourceIcon';

export default function TabIpsScreen() {

  // Define a type for the tiles array
  type Tile = {
    id: number;
    label: string;
    icon: string;
    type: 'ionicon' | 'fontawesome6';
  };

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
      <Text style={styles.title}>International Patient Summary</Text>
      <View style={styles.tilesContainer}>
        {tiles.map((tile) => (
            <Pressable key={tile.id} style={styles.tile} onPress={() => alert(`${tile.label} pressed!`)}>
              <Icon type={tile.type} name={tile.icon} size={32} color="black" />
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </Pressable>
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
  tile: {
    width: '45%', // Two tiles per row
    aspectRatio: 1, // Make tiles square
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 10,
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  tileLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});
