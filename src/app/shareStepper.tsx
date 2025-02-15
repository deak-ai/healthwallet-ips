import SectionCard from "@/components/SectionCard";
import { useIpsData } from "@/contexts/IpsDataContext";
import { Icon } from "@/components/MultiSourceIcon";
import CustomLoader from "@/components/reusable/loader";
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
import { useResourceSelection } from "@/hooks/useResourceSelection";
import { useWalletShare } from "@/hooks/useWalletShare";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const [localSelectedElement, setLocalSelectedElement] = useState<
    { code: string; label: string; resourceUris: string[] }[]
  >(parsedSelectedElement);

  const currentCode = parsedSelectedElement[currentStep].code;
  const { selectedIds, handleSelect, selectAllState, handleSelectAll } = useResourceSelection(ipsData, currentCode);
  const { loading, shareToWallet } = useWalletShare();

  // Reset state when component mounts or when selectedElement changes
  useEffect(() => {
    setCurrentStep(0);
    setLocalSelectedElement(parsedSelectedElement);
  }, [selectedElement]);

  // Update localSelectedElement when selection changes
  useEffect(() => {
    setLocalSelectedElement(prev =>
      prev.map(item =>
        item.code === currentCode
          ? { ...item, resourceUris: selectedIds }
          : item
      )
    );
  }, [selectedIds, currentCode]);

  const handleNext = async () => {
    if (currentStep < stepNumber - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      try {
        if (!ipsData) return;

        for (const element of localSelectedElement) {
          if (element.resourceUris.length > 0) {
            const success = await shareToWallet(
              ipsData,
              element.code,
              element.label,
              element.resourceUris
            );
            if (!success) return;
          }
        }

        router.push({
          pathname: "/ips",
        });
      } catch (error) {
        console.error("Error sharing data:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to share data",
          position: "bottom",
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon
              type="ionicon"
              name="chevron-back-circle-outline"
              size={32}
              color={theme === "dark" ? palette.neutral.white : palette.neutral.black}
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
              {selectAllState ? "Deselect All" : "Select All"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.sectionContainer}>
              {ipsData &&
                (ipsData.flattenedResources[currentCode] || [])
                  .map((item: any, index: number) => (
                    <SectionCard
                      key={index}
                      flattenedResource={item}
                      selected={selectedIds.includes(item.uri)}
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
                backgroundColor: currentStep === 0
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
                {
                  backgroundColor:
                    index === currentStep
                      ? palette.primary.dark
                      : palette.primary.light,
                },
              ]}
            />
          ))}
        </View>
        {loading && <CustomLoader />}
      </View>
    </SafeAreaView>
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
