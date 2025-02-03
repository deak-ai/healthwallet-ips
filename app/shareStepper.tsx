import SectionCard from "@/components/card";
import { useIpsData } from "@/components/IpsDataContext";
import {
  filterResourceWrappers,
  getProcessor,
} from "@/components/ipsResourceProcessor";
import { Icon } from "@/components/MultiSourceIcon";
import CustomLoader from "@/components/reusable/loader";
import { WaltIdIssuerApi } from "@/components/waltIdIssuerApi";
import { WaltIdSmartHealthCardIssuer } from "@/components/waltIdSmartHealthCardIssuer";
import { WaltIdWalletApi } from "@/components/waltIdWalletApi";
import { getPalette } from "@/constants/Colors";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from "react-native";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import { IpsData } from "@/components/fhirIpsModels";

const Stepper = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const route = useRoute();
  const router = useRouter();
  const { selectedElement } = route.params as {
    setSelectedElement: React.Dispatch<any>;
    selectedElement: any;
  };

  const parsedSelectedElement = JSON.parse(selectedElement);
  const stepNumber = parsedSelectedElement.length;
  const theme = useColorScheme() ?? "light";
  const palette = getPalette(theme === "dark");
  const navigation = useNavigation();

  const { ipsData } = useIpsData();
  const titles = parsedSelectedElement.map(
    (item: { code: string; label: string }) => item.label
  );
  const [loading, setLoading] = useState(false);
  const [selectAllStates, setSelectAllStates] = useState<{
    [key: number]: boolean;
  }>({});

  const [localSelectedElement, setLocalSelectedElement] = useState<
    { code: string; label: string; resourceUris: string[] }[]
  >(parsedSelectedElement);

  // Reset state when component mounts or when selectedElement changes
  useEffect(() => {
    setCurrentStep(0);
    setLocalSelectedElement(parsedSelectedElement);
    setSelectAllStates({});
    setLoading(false);

    // Cleanup function when component unmounts
    return () => {
      setCurrentStep(0);
      setLocalSelectedElement([]);
      setSelectAllStates({});
      setLoading(false);
    };
  }, [selectedElement]);

  useEffect(() => {
    if (localSelectedElement.length > 0 && ipsData) {
      const selectedCodes =
        localSelectedElement.find(
          (item: any) => item.code === parsedSelectedElement[currentStep].code
        )?.resourceUris || [];

      const totalItems = getProcessor(
        parsedSelectedElement[currentStep].code
      ).process(ipsData).length;

      setSelectAllStates((prev) => ({
        ...prev,
        [currentStep]: selectedCodes.length === totalItems,
      }));
    }
  }, [localSelectedElement, currentStep]);

  const handleSelectAll = () => {
    setSelectAllStates((prev) => {
      const newSelectAll = !prev[currentStep];

      if (ipsData) {
        setLocalSelectedElement((prevSelectedElement: any) =>
          prevSelectedElement.map((item: any) =>
            item.code === parsedSelectedElement[currentStep].code
              ? {
                  ...item,
                  resourceUris: newSelectAll
                    ? getProcessor(item.code)
                        .process(ipsData)
                        .map((resource: any) => resource.uri)
                    : [], // Deselect all
                }
              : item
          )
        );
      }

      return { ...prev, [currentStep]: newSelectAll };
    });
  };

  const handleNext = async () => {
    if (currentStep < stepNumber - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      try {
        setLoading(true);
        if (ipsData) {
          for (const element of localSelectedElement) {
            const resourceWrappers = filterResourceWrappers(
              ipsData,
              element.code
            );
            const savedUsername = await SecureStore.getItemAsync("username");
            const savedPassword = await SecureStore.getItemAsync("password");

            const issuerApi = new WaltIdIssuerApi(
              "https://issuer.healthwallet.li"
            );
            const walletApi = new WaltIdWalletApi(
              "https://wallet.healthwallet.li",
              savedUsername || "",
              savedPassword || ""
            );
            const loginData = await walletApi.login();
            if (loginData.token) {
              const selectedPatientRessourcesWrappers = resourceWrappers.filter(
                (resourceWrapper: any) =>
                  element.resourceUris.includes(
                    resourceWrapper.fullUrl
                  )
              );

              const smartHealthCardIssuer = new WaltIdSmartHealthCardIssuer(
                issuerApi,
                walletApi
              );

              await smartHealthCardIssuer.issueAndAddToWallet(
                "Self-issued " + element.label,
                ipsData.getPatientResource(),
                selectedPatientRessourcesWrappers
              );

              Toast.show({
                type: "success",
                text1: "success",
                text2: "Data shared successfully",
                position: "bottom",
              });
              router.push({
                pathname: "/ips",
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to login.",
                position: "bottom",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error sharing data:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed share data",
          position: "bottom",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSelect = (uri: string) => {
    setLocalSelectedElement((prevSelectedElement: any) => {
      const updatedSelection = prevSelectedElement.map((item: any) =>
        item.code === parsedSelectedElement[currentStep].code
          ? {
              ...item,
              resourceUris: item.resourceUris.includes(uri)
                ? item.resourceUris.filter(
                    (resourceUri: string) => resourceUri !== uri
                  )
                : [...item.resourceUris, uri],
            }
          : item
      );

      // Check if all items are selected
      if (ipsData) {
        const allSelected =
          updatedSelection.find(
            (item: any) => item.code === parsedSelectedElement[currentStep].code
          )?.resourceUris.length ===
          getProcessor(parsedSelectedElement[currentStep].code).process(ipsData)
            .length;

        setSelectAllStates((prev) => ({ ...prev, [currentStep]: allSelected }));
      }

      return updatedSelection;
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon
            type="ionicon"
            name="chevron-back-circle-outline"
            size={32}
            color={
              theme === "dark" ? palette.neutral.white : palette.neutral.black
            }
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: palette.text }]}>
          {titles[currentStep]}
        </Text>
        <TouchableOpacity
          style={[
            styles.selectAllButton,
            { backgroundColor: palette.secondary.main },
          ]}
          onPress={handleSelectAll}
        >
          <Text
            style={[
              styles.selectAllButtonText,
              { color: palette.neutral.white },
            ]}
          >
            {selectAllStates[currentStep] ? "Deselect All" : "Select All"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.sectionContainer}>
            {ipsData &&
              getProcessor(localSelectedElement[currentStep].code)
                .process(ipsData)
                .map((item: any, index: number) => (
                  <SectionCard
                    key={index}
                    resource={item}
                    selected={localSelectedElement[
                      currentStep
                    ].resourceUris.includes(item.uri)}
                    onSelect={() => handleSelect(item.uri)}
                    label={localSelectedElement[currentStep].label}
                  />
                ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonsContainerFixed}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                currentStep === 0
                  ? palette.neutral.lightGrey
                  : palette.primary.dark,
            },
          ]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Text style={[styles.buttonText, { color: palette.neutral.white }]}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: palette.primary.dark }]}
          onPress={handleNext}
          //disabled={currentStep === stepNumber - 1}
        >
          <Text style={[styles.buttonText, { color: palette.neutral.white }]}>
            {currentStep === stepNumber - 1 ? "Share" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stepIndicatorContainer}>
        {Array.from({ length: stepNumber }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepIndicator,
              { backgroundColor: palette.primary.light },
              currentStep === index && {
                backgroundColor: palette.primary.dark,
              },
            ]}
          />
        ))}
      </View>
      {loading && <CustomLoader />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
  },
  buttonsContainerFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    position: "absolute",
    bottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: "bold",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  stepIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginHorizontal: 5,
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingTop: 20,
  },
  sectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 10,
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  selectAllButtonText: {
    fontWeight: "bold",
  },
});

export default Stepper;
