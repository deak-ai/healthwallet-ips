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
import { useIpsData } from "@/components/IpsDataContext";
import { useClickedTab } from "@/components/clickedTabContext";
import Header from "@/components/reusable/header";
import { Icon } from "@/components/MultiSourceIcon";
import CustomLoader from "@/components/reusable/loader";
import BottomSheet from "@/components/reusable/bottomSheet";
import * as SecureStore from "expo-secure-store";
import { useConfiguration } from "@/components/ConfigurationContext";

export default function ConnectorsScreen() {
  const [inputValue, setInputValue] = useState<string>("");
  const theme = useColorScheme() ?? "light";
  const refRBSheet = useRef<any>(null);
  const { clickedTab } = useClickedTab();
  const palette = getPalette(theme === "dark");
  const { loadFhirData, isConfigured, patientId, savePatientId, isLoading } = useConfiguration();
  const { setIpsData, ipsData } = useIpsData();

  useEffect(() => {
    const loadPatientId = async () => {
      setInputValue(patientId || "");
    };
    loadPatientId();
  }, []);

  useEffect(() => {
    if (!isConfigured && refRBSheet?.current?.open) {
      refRBSheet.current.open();
    }
  }, [isConfigured]);

  const handleSavePatientId = async () => {
    try {
      await savePatientId(inputValue);
    } catch (error) {
      console.error("Error saving patient ID:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title={"Connectors"} />

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
          <CustomLoader />
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

        {!isConfigured && (
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
