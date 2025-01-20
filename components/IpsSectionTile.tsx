// components/IpsSectionTile.tsx

import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, useThemeColor } from "@/components/Themed";
import { IconType, Icon } from "@/components/MultiSourceIcon";
import Colors from "@/constants/Colors";
import { IpsSectionCode, IpsSectionCodeKey } from "@/components/fhirIpsModels";

// Define a type for the tiles array
export type Tile = {
  id: number;
  label: string;
  icon: string;
  type: IconType;
  code: (typeof IpsSectionCode)[IpsSectionCodeKey]["code"];
};

export const IPS_TILES: readonly Tile[] = [
  {
    id: 1,
    label: IpsSectionCode.Allergies.label,
    icon: "allergies",
    type: "fontawesome5",
    code: IpsSectionCode.Allergies.code,
  },
  {
    id: 2,
    label: IpsSectionCode.Medications.label,
    icon: "pills",
    type: "fontawesome6",
    code: IpsSectionCode.Medications.code,
  },
  {
    id: 3,
    label: IpsSectionCode.Problems.label,
    icon: "report-problem",
    type: "materialicons",
    code: IpsSectionCode.Problems.code,
  },
  {
    id: 4,
    label: IpsSectionCode.Procedures.label,
    icon: "bandage-outline",
    type: "ionicon",
    code: IpsSectionCode.Procedures.code,
  },
  {
    id: 5,
    label: IpsSectionCode.Immunizations.label,
    icon: "shield-checkmark-outline",
    type: "ionicon",
    code: IpsSectionCode.Immunizations.code,
  },
  {
    id: 6,
    label: IpsSectionCode.Results.label,
    icon: "list-outline",
    type: "ionicon",
    code: IpsSectionCode.Results.code,
  },
  {
    id: 7,
    label: IpsSectionCode.Devices.label,
    icon: "devices-other",
    type: "materialicons",
    code: IpsSectionCode.Devices.code,
  },
] as const;

export function IpsSectionTile(props: { onPress: () => void; tile: Tile }) {
  const backgroundColor = useThemeColor(
    { light: Colors.light.cardBackground, dark: Colors.dark.cardBackground },
    "background"
  );
  const borderColor = useThemeColor(
    { light: Colors.light.border, dark: Colors.dark.border },
    "border"
  );
  const iconColor = useThemeColor(
    { light: Colors.light.icon, dark: Colors.dark.icon },
    "icon"
  );
  const textColor = useThemeColor(
    { light: Colors.light.icon, dark: Colors.dark.icon },
    "icon"
  );
  return (
    <TouchableOpacity
      style={[{backgroundColor},cardStyles.card]}
      activeOpacity={0.8}
      onPress={props.onPress}
    >
      <Icon
        type={props.tile.type}
        name={props.tile.icon}
        size={38}
        color={iconColor}
      />
      <Text style={[{color:textColor},cardStyles.title]}>{props.tile.label}</Text>
    </TouchableOpacity>
  );
}


const cardStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 20,
   // backgroundColor: "#B7E0E1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    width: "47%",
    height: "20%",
    aspectRatio: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
   // color: "#00796B",
    fontWeight: "bold",
    marginTop: 5,
  },
});
