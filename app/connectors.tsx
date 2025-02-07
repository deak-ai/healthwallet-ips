import React, { useEffect, useRef, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import { getPalette } from "@/constants/Colors";
import Header from "@/components/reusable/header";
import { Icon } from "@/components/MultiSourceIcon";
import CustomLoader from "@/components/reusable/loader";
import BottomSheet from "@/components/reusable/bottomSheet";
import { useConnectorConfiguration } from "@/components/ConnectorConfigurationContext";
import { useNavigation } from "@react-navigation/native";

export default function ConnectorsScreen() {
  const [inputValue, setInputValue] = useState<string>("");
  const theme = useColorScheme() ?? "light";
  const refRBSheet = useRef<any>(null);
  const palette = getPalette(theme === "dark");
  const { loadFhirData, isConnectorConfigured, patientId, savePatientId, isLoading } = useConnectorConfiguration();
  const navigation = useNavigation();

  useEffect(() => {
    setInputValue(patientId || "");
  }, [patientId]);

  useEffect(() => {
    if (!isConnectorConfigured && !isLoading && refRBSheet?.current?.open) {
      refRBSheet.current.open();
    }
  }, [isConnectorConfigured, isLoading]);

  const handleSavePatientId = async () => {
      await savePatientId(inputValue);
  };

  const handleBack = () => {
    // Get the previous route name from navigation state
    const state = navigation.getState();
    const previousRoute = state?.routes[state.routes.length - 2]?.name;
    
    // If coming from ips tab and not configured, prevent navigation
    if (previousRoute === '(tabs)' && !isConnectorConfigured) {
      return;
    }
    
    // Otherwise, allow normal back navigation
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title={"Connectors"} onBack={handleBack} />

        <Text style={[styles.label, { color: palette.text }]}>Enter Patient ID:</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme === "light" ? palette.secondary.light : palette.neutral.white,
              color: palette.text
            },
          ]}
          placeholder="Enter Patient ID"
          placeholderTextColor={palette.text}
          value={inputValue}
          onChangeText={setInputValue}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme === "dark" ? palette.primary.main : palette.secondary.main,
              },
            ]}
            onPress={handleSavePatientId}
            disabled={isLoading}
          >
            <Text style={[styles.buttonText, { color: palette.neutral.white }]}>
              Save Patient ID
            </Text>
          </TouchableOpacity>
        </View>

        {patientId && (
          <Text style={[styles.savedInfo, { color: palette.text }]}>
            Current Patient ID: {patientId}
          </Text>
        )}

        {isLoading ? (
          <CustomLoader variant="overlay" />
        ) : (
          <TouchableOpacity
            style={styles.titleRow}
            onPress={() => loadFhirData(patientId)}
          >
            <Icon
              type={"fontawesome6"}
              name={"download"}
              size={24}
              color={palette.primary.main}
            />
            <Text style={[styles.downloadTitle, { color: palette.primary.main }]}>
              Download
            </Text>
          </TouchableOpacity>
        )}

        {!isConnectorConfigured && (
          <BottomSheet
            ref={refRBSheet}
            title="ID Required"
            description="A valid Patient ID is required to continue."
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
    gap: 18,
  },
  label: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    height: 60,
    borderWidth: 1,
    padding: 10,
    marginBottom: 5,
    borderRadius: 6,
  },
  savedInfo: {
    marginTop: 20,
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: "800",
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
  infoDescription: { 
    fontWeight: "700" 
  },
  downloadTitle: {
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    marginLeft: 10
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    padding: 12,
    width: "100%",
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 10,
  },
});
