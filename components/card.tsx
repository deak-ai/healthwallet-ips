import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Icon } from "@/components/MultiSourceIcon";

const SectionCard = (resource: any) => {
  const {
    name,
    criticality,
    clinicalStatus,
    status,
    category,
    type,
  } = resource.resource;

  return (
    <View style={styles.card}>
      <View style={styles.rowContainer}>
        <View style={styles.iconContainer}>
          <Icon name="allergies" size={24} color="#fff" type="fontawesome5" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{name}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{type || "-"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>{category || "-"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Criticality:</Text>
              <Text style={styles.value}>{criticality || "-"}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Clinical Status:</Text>
              <Text style={styles.value}>{clinicalStatus || "-"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Status */}
      {status && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#38A8A8",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#154E47",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flexShrink: 1,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#777",
    flex: 1,
  },
  statusContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#d4edda",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2e7d32",
  },
});

export default SectionCard;
