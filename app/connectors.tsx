import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, useColorScheme, TouchableOpacity } from "react-native";
import { Text, View, TextInput } from "@/components/Themed";
import * as SecureStore from "expo-secure-store";
import { Icon } from "@/components/MultiSourceIcon";
import { useFocusEffect, useNavigation } from "expo-router";
import { useIpsData } from "@/components/IpsDataContext";
import { FhirUrlStreamProcessor } from "@/components/fhirStreamProcessorUrl";
import CustomLoader from "@/components/reusable/loader";
import Toast from "react-native-toast-message";
import { useClickedTab } from "@/components/clickedTabContext";
import { getPalette } from "@/constants/Colors";
import BottomSheet from "@/components/reusable/bottomSheet";
import Header from "@/components/reusable/header";

export default function Connectores() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const theme = useColorScheme() ?? "light";
  const refRBSheet = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const { clickedTab } = useClickedTab();
  const palette = getPalette(theme === "dark");

  const { setIpsData, ipsData } = useIpsData();
  const navigation = useNavigation();
  // Load the patient ID from SecureStore when the component mounts
  useEffect(() => {
    const loadPatientId = async () => {
      try {
        const savedPatientId = await SecureStore.getItemAsync("patientId");

        setPatientId(savedPatientId);
        setInputValue(savedPatientId || "");

        //if we have already data navigate to ips screen
        if (
          savedPatientId &&
          ipsData &&
          ipsData.sections.length !== 0 &&
          ipsData.resources.length !== 0
        ) {
          //   navigation.navigate("ips" as never);
        }
      } catch (error) {
        console.error("Error loading patient ID:", error);
      }
    };
    loadPatientId();
  }, []);

  useEffect(() => {
    if (
      !patientId ||
      !ipsData ||
      ipsData.resources.length === 0 ||
      ipsData.sections.length === 0
    ) {
      refRBSheet?.current.open();
    }
  }, [patientId, clickedTab, ipsData]);

  useFocusEffect(
    React.useCallback(() => {
      const loadPatientId = async () => {
        try {
          const savedPatientId = await SecureStore.getItemAsync("patientId");
          setPatientId(savedPatientId);
        } catch (error) {
          console.error("Error loading patient ID:", error);
        }
      };
      (async () => {
        await loadPatientId();
      })();
    }, [])
  );
  // Save the patient ID to SecureStore
  const savePatientId = async () => {
    try {
      await SecureStore.setItemAsync("patientId", inputValue);
      setPatientId(inputValue);

      await loadFhirData(inputValue);
    } catch (error) {
      console.error("Error saving patient ID:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save Patient ID securely",
        position: "bottom",
      });
    }
  };

  const loadFhirData = async (id: string | null) => {
    try {
      setLoading(true);
      if (id) {
        //const url = `http://localhost:8800/fhir-examples/ips-fhir/${patientId}-ips.json`;
        const url = `https://fhir-static.healthwallet.li/fhir-examples/ips-fhir/${id}-ips.json`;
        //const url = `https://fhir.healthwallet.li/fhir/Patient/${patientId}/$summary?_format=json`;
        const ipsData = await new FhirUrlStreamProcessor().streamData(url);
        console.log(
          "FHIR data retrieved ",
          ipsData.sections.length,
          ipsData.resources.length
        );
        setIpsData(ipsData); // Set the data in context
        if (
          ipsData &&
          ipsData.sections.length !== 0 &&
          ipsData.resources.length !== 0
        ) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Patient data loaded successfully",
            position: "bottom",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to load FHIR data.",
            position: "bottom",
          });
        }

        // router.push({
        //   pathname: "/modal",
        //   params: {
        //     fhirData: yaml.dump(ipsData?.resources?.[0]), // Use the first resource for demo purposes
        //     title: `Patient ${patientId} Data`,
        //   },
        // });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Patient ID not found, please check settings.",
          position: "bottom",
        });
      }
    } catch (error) {
      console.error("Error fetching FHIR data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load FHIR data.",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title={"Connectors"} />

      <BottomSheet
        ref={refRBSheet}
        title="ID Required"
        description="A valid Patient ID is required to continue."
      />

      <Text style={styles.label}>Enter Patient ID:</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor:
              theme === "light"
                ? palette.secondary.light
                : palette.neutral.white,
          },
        ]}
        placeholder="Enter Patient ID"
        value={inputValue}
        onChangeText={setInputValue}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: palette.secondary.light }]}
          onPress={savePatientId}
        >
          <Text style={styles.buttonText}>Save Patient ID</Text>
        </TouchableOpacity>
      </View>
      {patientId && (
        <Text style={styles.savedInfo}>Current Patient ID: {patientId}</Text>
      )}
      {loading ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    paddingHorizontal: 20,
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
    width: "90%",
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 6,
  },
  savedInfo: {
    marginTop: 20,
    fontSize: 16,
    fontStyle: "italic",
    fontWeight: 800,
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
  infoDescription: { fontWeight: 700 },
  downloadTitle: {
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
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
