import React, { useState } from 'react';
import { View, ActivityIndicator, Alert, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { FhirUrlStreamProcessor } from "@/components/fhirStreamProcessorUrl";
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Colors from "@/constants/Colors";
import { useRouter } from 'expo-router';
import { useIpsData } from '@/components/IpsDataContext';
import { IconType, Icon } from '@/components/MultiSourceIcon';
import yaml from "js-yaml";

export default function TabLoadIpsScreen() {
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const router = useRouter();
  const { setIpsData } = useIpsData();

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
      setLoading(true);
      if (patientId) {
        const url = `http://localhost:8800/fhir-examples/ips-fhir/${patientId}-ips.json`;
        //const url = `https://fhir.healthwallet.li/fhir/Patient/${patientId}/$summary?_format=json`;
        const ipsData = await new FhirUrlStreamProcessor().streamData(url);
        console.log('FHIR data retrieved ', ipsData.sections.length, ipsData.resources.length);
        setIpsData(ipsData); // Set the data in context

        router.push({
          pathname: '/modal',
          params: {
            fhirData: yaml.dump(ipsData.resources[0]), // Use the first resource for demo purposes
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
      setLoading(false);
    }
  };

  const issueFhirVC = async () => {
    // Implement the upload functionality here
    Alert.alert('Upload', 'Upload functionality not implemented yet.');
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
      <Pressable onPress={issueFhirVC}>
        {({ pressed }) => (
          <FontAwesome6
            name="file-export"
            size={100}
            color={Colors[colorScheme ?? 'light'].text}
            style={{ marginTop: 20, opacity: pressed ? 0.5 : 1 }}
          />

        )}
      </Pressable>
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