import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import { Icon } from "@/components/MultiSourceIcon";
import Colors from "@/constants/Colors";
import { useThemeColor } from "./Themed";

const SectionCard = (resource: any) => {
  const { name, criticality, clinicalStatus, status, category, type } =
    resource.resource;

    const backgroundColor = useThemeColor({ light: Colors.light.cardBackground, dark: Colors.dark.cardBackground }, 'background');
    const labelColor = useThemeColor({ light: Colors.light.label, dark: Colors.dark.label }, 'text');

    return (
    <View style={[styles.card,{backgroundColor}]}>
      <View style={styles.rowContainer}>
        <View style={styles.iconContainer}>
          <ImageBackground
            source={require("../assets/images/iconBackground.png")}
            style={styles.iconContainer}
          >
            <Icon name="allergies" size={24} color="#fff" type="fontawesome5" />
          </ImageBackground>
        </View>
        <View style={styles.titleAndDetails}>
          <Text style={[styles.title,{color:labelColor}]}>{name}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailColumn}>
              <View style={styles.detailRow}>
                <Text style={[styles.label,{color:labelColor}]}>Type:</Text>
                <Text style={[styles.value,{color:labelColor}]}>{type || "-"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.label,{color:labelColor}]}>Category:</Text>
                <Text style={[styles.value,{color:labelColor}]}>{category || "-"}</Text>
              </View>
            </View>
            <View style={styles.detailColumn}>
              <View style={styles.detailRow}>
                <Text style={[styles.label,{color:labelColor}]}>Criticality:</Text>
                <Text style={[styles.value,{color:labelColor}]}>{criticality || "-"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.label,{color:labelColor}]}>Clinical Status:</Text>
                <Text style={[styles.value,{color:labelColor}]}>{clinicalStatus || "-"}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{"Active"}</Text>
      </View>
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
    borderColor: "#2563EA",
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
    color: "#333",
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
    color: "#777",
  },
  statusContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#2D77FEC7",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 12,
    marginTop: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
  },
  detailColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default SectionCard;
