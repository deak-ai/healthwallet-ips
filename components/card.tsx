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
  resource: any;
  selected: boolean;
  onSelect: () => void;
};

const SectionCard = ({ resource, selected, onSelect }: SectionCardProps) => {

  const { name, criticality, clinicalStatus, status, category, type } =
    resource;
  const theme = useColorScheme() ?? "light";

  const palette = getPalette(theme === "dark");
  const labelColor = palette.neutral.black;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: !selected
            ? palette.background
            : palette.secondary.lighter,
          borderColor: !selected
            ? palette.primary.lighter
            : palette.secondary.dark,
        },
      ]}
      onPress={onSelect}
    >
      <View style={styles.rowContainer}>
        <View style={styles.titleAndDetails}>
          <Text style={[styles.title, { color: palette.primary.main }]}>
            {name}
          </Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailColumn}>
              <View style={styles.detailRow}>
                <Text style={[styles.label, { color: labelColor }]}>Type:</Text>
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
                  Clinical Status:
                </Text>
                <Text style={[styles.value, { color: labelColor }]}>
                  {clinicalStatus || "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.statusContainer,
          { backgroundColor: palette.primary.dark },
        ]}
      >
        <Text style={[styles.statusText, { color: palette.neutral.white }]}>
          {status || "Active"}
        </Text>
      </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  value: {
    fontSize: 14,
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
});

export default SectionCard;
