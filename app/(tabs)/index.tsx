import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  useColorScheme,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { Text, View, TextInput } from "@/components/Themed";
import * as SecureStore from "expo-secure-store";
import RBSheet from "react-native-raw-bottom-sheet";
import { Icon } from "@/components/MultiSourceIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useIpsData } from "@/components/IpsDataContext";
import { FhirUrlStreamProcessor } from "@/components/fhirStreamProcessorUrl";
import yaml from "js-yaml";
import CustomLoader from "@/components/loader";
import Toast from "react-native-toast-message";
import { useClickedTab } from "@/components/clickedTabContext";

export default function TabSettingsScreen() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  const theme = useColorScheme() ?? "light";
  const refRBSheet = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { clickedTab } = useClickedTab();

  const { setIpsData } = useIpsData();

  useEffect(() => {
    if (!patientId) {
      refRBSheet?.current.open();
    }
  }, [clickedTab,patientId]);

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
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Patient ID saved securely!",
        position: "bottom",
      });
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

  const loadFhirData = async () => {
    try {
      setLoading(true);
      if (patientId) {
        //const url = `http://localhost:8800/fhir-examples/ips-fhir/${patientId}-ips.json`;
        const url = `https://fhir-static.healthwallet.li/fhir-examples/ips-fhir/${patientId}-ips.json`;
        //const url = `https://fhir.healthwallet.li/fhir/Patient/${patientId}/$summary?_format=json`;
        const ipsData = await new FhirUrlStreamProcessor().streamData(url);
        console.log(
          "FHIR data retrieved ",
          ipsData.sections.length,
          ipsData.resources.length
        );
        setIpsData(ipsData); // Set the data in context

        router.push({
          pathname: "/modal",
          params: {
            fhirData: yaml.dump(ipsData.resources[0]), // Use the first resource for demo purposes
            title: `Patient ${patientId} Data`,
          },
        });
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

  const rBSheet = () => {
    return (
      <RBSheet
        ref={refRBSheet}
        height={200}
        customStyles={{
          container: {
            justifyContent: "center",
            alignItems: "center",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            backgroundColor: theme === "dark" ? "#1D1D1F" : "white",
          },
        }}
      >
        <View style={[styles.sheetContent]}>
          <View
            style={[
              styles.titleRow,
              { backgroundColor: theme === "dark" ? "#1D1D1F" : "white" },
            ]}
          >
            <Icon
              type={"ionicon"}
              name={"information-circle"}
              size={38}
              color="#154E47"
            />
            <Text style={styles.infoTitle}> ID Required</Text>
          </View>
          <Text style={styles.infoDescription}>
            A valid Patient ID is required to continue.
          </Text>
        </View>
      </RBSheet>
    );
  };

  const settingsMainContent = () => {
    return (
      <View style={styles.container}>
        {rBSheet()}
        <Text style={styles.label}>Enter Patient ID:</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme == "light" ? "" : "#154E474D" },
            { borderColor: theme === "light" ? "" : "#FFFFFF" },
          ]}
          placeholder="Enter Patient ID"
          value={inputValue}
          onChangeText={setInputValue}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={savePatientId}>
            <Text style={styles.buttonText}>Save Patient ID</Text>
          </TouchableOpacity>
        </View>
        {patientId && (
          <Text style={styles.savedInfo}>Current Patient ID: {patientId}</Text>
        )}
        {loading ? (
          <CustomLoader />
        ) : (
          <TouchableOpacity style={styles.titleRow} onPress={loadFhirData}>
            <Icon
              type={"fontawesome6"}
              name={"download"}
              size={24}
              color="#154E47"
            />
            <Text style={styles.downloadTitle}> Download</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {theme === "dark" ? (
        settingsMainContent()
      ) : (
        <ImageBackground
          source={require("../../assets/images/bg.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {settingsMainContent()}
        </ImageBackground>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
    gap: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  label: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    height: 60,
    borderColor: "#221F1F8C",
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
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
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
    color: "#83B0AB",
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#ff3b3b",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  infoDescription: { fontWeight: 700 },
  downloadTitle: {
    color: "#154E47",
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
    backgroundColor: "#B7E0E1",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgb(138, 34, 34)",
  },
});
