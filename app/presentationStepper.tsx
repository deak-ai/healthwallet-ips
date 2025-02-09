import SectionCard from "@/components/card";
import { useIpsData } from "@/components/IpsDataContext";
import { getProcessor } from "@/components/ipsResourceProcessor";
import { Icon } from "@/components/MultiSourceIcon";
import { getPalette } from "@/constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ScrollView,
} from "react-native";
import { useResourceSelection } from "@/hooks/useResourceSelection";
import { SafeAreaView } from "react-native-safe-area-context";

const PresentationStepper = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { selectedElement, openId4VpUrl } = useLocalSearchParams<{
    selectedElement: string;
    openId4VpUrl: string;
  }>();

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

        // TODO: Handle openid4vp presentation with localSelectedElement and openId4VpUrl
        console.log('Selected resources:', localSelectedElement);
        console.log('OpenID4VP URL:', openId4VpUrl);

        router.push('/ips');
      } catch (error) {
        console.error("Error preparing presentation:", error);
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
            style={[
              styles.backButton,
              { backgroundColor: palette.secondary.light },
            ]}
            onPress={() => navigation.goBack()}
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
              {selectAllState ? "Deselect All" : "Select All"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <View style={styles.sectionContainer}>
              {ipsData &&
                getProcessor(currentCode)
                  .process(ipsData)
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
              {currentStep === stepNumber - 1 ? "Present" : "Next"}
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
                      ? palette.primary.main
                      : palette.neutral.lightGrey,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  selectAllButton: {
    padding: 8,
    borderRadius: 8,
  },
  selectAllButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  buttonsContainerFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default PresentationStepper;
