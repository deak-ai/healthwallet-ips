import React, { useState } from 'react';
import { View, ActivityIndicator, Alert, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { FhirUrlStreamProcessor } from "@/components/fhirStreamProcessorUrl";
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router'; // Import useRouter from expo-router

export default function TabLoadIpsScreen() {
  //const [fhirData, setFhirData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [patientId, setPatientId] = useState<string | null>(null);
  const router = useRouter(); // Get the router object from expo-router

  // Load the patient ID from SecureStore when the component receives focus
  useFocusEffect(
      React.useCallback(() => {
        const loadPatientId = async () => {
          try {
            const savedPatientId = await SecureStore.getItemAsync('patientId');
            if (savedPatientId) {
              setPatientId(savedPatientId);
            }
          } catch (error) {
            console.error('Error loading patient ID:', error);
          }
        };
        (async () => {
          await loadPatientId();
        })();
      }, [])
  );

  const loadFhirData = async () => {
    try {
      setLoading(true); // Start loading
      if (patientId) {
        //const url = `https://fhir.healthwallet.li/fhir/Patient/${patientId}/_history/1?_format=json`;
        const url = `https://fhir.healthwallet.li/fhir/Patient/${patientId}/$summary?_format=json`;
        const ipsData = await new FhirUrlStreamProcessor().streamData(url);
        console.log('FHIR data retrieved ', ipsData.sections.length, ipsData.resources.length)
        const sectionsString = JSON.stringify(ipsData.sections, null, 2);

        //setFhirData(JSON.stringify(data, null, 2));

        // Once the data is loaded, programmatically navigate to the modal screen
        router.push({
          pathname: '/modal',
          params: {
            //fhirData: JSON.stringify(data, null, 2), // Pass the FHIR data to the modal
            fhirData: sectionsString,
            title: `Patient ${patientId} Data`
          }
        });
      } else {
        Alert.alert('Error', 'Patient ID not found, please check settings.');
      }
    } catch (error) {
      console.error('Error fetching FHIR data:', error);
      Alert.alert('Error', 'Failed to load FHIR data.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const colorScheme = useColorScheme();

  return (
      <View style={styles.container}>
        {loading ? (
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].text} />
        ) : (
            <Pressable onPress={loadFhirData}>
              {({ pressed }) => (
                  <FontAwesome
                      name="download"
                      size={100}
                      color={Colors[colorScheme ?? 'light'].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
              )}
            </Pressable>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
