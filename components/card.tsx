import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { getPalette } from "@/constants/Colors";

type SectionCardProps = {
  flattenedResource: any;
  selected: boolean;
  onSelect: () => void;
  label: string;
};

const SectionCard = ({
  flattenedResource,
  selected,
  onSelect,
  label,
}: SectionCardProps) => {
  const {
    name,
    criticality,
    clinicalStatus,
    category,
    type,
    recordedDate,
    dosageInstructions,
    status,
  } = flattenedResource;
  const theme = useColorScheme() ?? "light";
  const palette = getPalette(theme === "dark");
  const labelColor =
    theme === "light" ? palette.neutral.black : palette.neutral.white;
  const renderContentByLabel = (label: string | undefined) => {
    switch (label) {
      case "Allergies":
        return (
          <>
            <View style={styles.rowContainer}>
              <View style={styles.titleAndDetails}>
                <Text style={[styles.title, { color: palette.primary.main }]}>
                  {name}
                </Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailColumn}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.label, { color: labelColor }]}>
                        Type:
                      </Text>
                      <Text style={[styles.value, { color: labelColor }]}>
                        {type || "-"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.label, { color: labelColor }]}>
                        Category:
                      </Text>
                      <Text style={[styles.value, { color: labelColor }]}>
                        {category || "-"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailColumn}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.label, { color: labelColor }]}>
                        Criticality:
                      </Text>
                      <Text style={[styles.value, { color: labelColor }]}>
                        {criticality || "-"}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={[styles.label, { color: labelColor }]}>
                        Status:
                      </Text>
                      <Text style={[styles.value, { color: labelColor }]}>
                        {clinicalStatus || "-"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.footerContainer}>
              <View style={styles.footerRow}>
                {recordedDate && (
                  <View style={styles.detailRow}>
                    <Text style={[styles.dateText, { color: labelColor }]}>
                      Recorded date:
                    </Text>
                    <Text style={[styles.dateText, { color: labelColor }]}>
                      {recordedDate?.split("T")[0] || "-"}
                    </Text>
                  </View>
                )}
                {clinicalStatus && (
                  <View
                    style={[
                      styles.statusContainer,
                      { backgroundColor: palette.primary.dark },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: palette.neutral.white },
                      ]}
                    >
                      {clinicalStatus}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        );
      case "Medications":
        return (
          <>
            <View style={styles.rowContainer}>
              <View style={styles.titleAndDetails}>
                <Text style={[styles.title, { color: palette.primary.main }]}>
                  {name}
                </Text>
                <View style={styles.detailsContainer}>
                  <View style={styles.detailColumn}>
                    <View style={styles.detailRow}>
                      <Text style={[styles.label, { color: labelColor }]}>
                        Dosage instructions:
                      </Text>
                      <Text style={[styles.value, { color: labelColor }]}>
                        {dosageInstructions || "-"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.footerContainer}>
              {status && (
                <View
                  style={[
                    styles.statusContainer,
                    { backgroundColor: palette.primary.dark },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: palette.neutral.white },
                    ]}
                  >
                    {status}
                  </Text>
                </View>
              )}
            </View>
          </>
        );
      case "Problems":
        return (
          <View style={styles.rowContainer}>
            <View style={styles.titleAndDetails}>
              <Text style={[styles.title, { color: palette.primary.main }]}>
                {name}
              </Text>
            </View>
          </View>
        );
      case "Procedures":
        return (
          <View style={styles.rowContainer}>
            <View style={styles.titleAndDetails}>
              <Text style={[styles.title, { color: palette.primary.main }]}>
                {name}
              </Text>
            </View>
          </View>
        );
      case "Immunizations":
        return (
          <View style={styles.rowContainer}>
            <View style={styles.titleAndDetails}>
              <Text style={[styles.title, { color: palette.primary.main }]}>
                {name}
              </Text>
            </View>
          </View>
        );
      case "Results":
        return (
          <View style={styles.rowContainer}>
            <View style={styles.titleAndDetails}>
              <Text style={[styles.title, { color: palette.primary.main }]}>
                {name}
              </Text>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.rowContainer}>
            <View style={styles.titleAndDetails}>
              <Text style={[styles.title, { color: palette.primary.main }]}>
                {name}
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: !selected
            ? palette.background
            : palette.secondary.lighter,
          borderColor: !selected
            ? theme === "dark"
              ? palette.secondary.light
              : palette.primary.lighter
            : palette.secondary.dark,
        },
      ]}
      onPress={onSelect}
    >
      {renderContentByLabel(label)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "92%",
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    borderWidth: 2,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderRadius: 8,
  },
  titleAndDetails: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  detailsContainer: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailRow: {
    gap: 5,
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
    flexShrink: 1,
    flexWrap: "wrap",
  },
  statusContainer: {
    alignSelf: "flex-end",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 20,
    marginTop: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    padding: 4,
  },
  detailColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  footerContainer: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    fontWeight: 400,
  },
});

export default SectionCard;
