import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, ScrollView } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useRoute } from '@react-navigation/native';

export default function ModalScreen() {
  const route = useRoute();
  const { fhirData } = route.params as { fhirData: string };
  const { title } = route.params as { title: string };
  //console.log('FHIR data: ', fhirData.slice(0,10000))

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text>{fhirData.slice(0, 100000)}</Text>
      </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  scrollView: {
    padding: 20,
  },
});
