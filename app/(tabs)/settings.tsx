import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, Alert } from 'react-native';
import { Text, View, TextInput } from '@/components/Themed';
import * as SecureStore from 'expo-secure-store';

export default function TabSettingsScreen() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  // Load the patient ID from SecureStore when the component mounts
  useEffect(() => {
    const loadPatientId = async () => {
      try {
        const savedPatientId = await SecureStore.getItemAsync('patientId');
        if (savedPatientId) {
          setPatientId(savedPatientId);
          setInputValue(savedPatientId);
        }
      } catch (error) {
        console.error('Error loading patient ID:', error);
      }
    };
    loadPatientId();
  }, []);

  // Save the patient ID to SecureStore
  const savePatientId = async () => {
    try {
      await SecureStore.setItemAsync('patientId', inputValue);
      setPatientId(inputValue);
      Alert.alert('Success', 'Patient ID saved securely!');
    } catch (error) {
      console.error('Error saving patient ID:', error);
      Alert.alert('Error', 'Failed to save Patient ID securely');
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

        <Text style={styles.label}>Patient ID:</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter Patient ID"
            value={inputValue}
            onChangeText={setInputValue}
        />

        <Button title="Save Patient ID" onPress={savePatientId} />

        {patientId && <Text style={styles.savedInfo}>Current Patient ID: {patientId}</Text>}
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
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  savedInfo: {
    marginTop: 20,
    fontSize: 16,
    fontStyle: 'italic',
  },
});
