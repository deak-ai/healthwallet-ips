// components/IpsSectionTile.tsx

import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Text } from "@/components/Themed";
import { IconType } from "@/components/MultiSourceIcon";
import { IpsSectionCode, IpsSectionCodeKey } from "@/components/fhirIpsModels";
import { getPalette } from "@/constants/Colors";

export type Tile = {
  id: number;
  label: string;
  icon: ImageSourcePropType;
  type?: IconType;
  code: (typeof IpsSectionCode)[IpsSectionCodeKey]["code"];
};

export const IPS_TILES: readonly Tile[] = [
  {
    id: 1,
    label: IpsSectionCode.Allergies.label,
    icon: require("../../assets/icons/allergies.png"),
    code: IpsSectionCode.Allergies.code,
  },
  {
    id: 2,
    label: IpsSectionCode.Medications.label,
    icon: require("../../assets/icons/medications.png"),
    code: IpsSectionCode.Medications.code,
  },
  {
    id: 3,
    label: IpsSectionCode.Problems.label,
    icon: require("../../assets/icons/problems.png"),
    code: IpsSectionCode.Problems.code,
  },
  {
    id: 4,
    label: IpsSectionCode.Procedures.label,
    icon: require("../../assets/icons/procedures.png"),
    code: IpsSectionCode.Procedures.code,
  },
  {
    id: 5,
    label: IpsSectionCode.Immunizations.label,
    icon: require("../../assets/icons/immunizations.png"),
    code: IpsSectionCode.Immunizations.code,
  },
  {
    id: 6,
    label: IpsSectionCode.Results.label,
    icon: require("../../assets/icons/results.png"),
    code: IpsSectionCode.Results.code,
  },
  {
    id: 7,
    label: IpsSectionCode.Devices.label,
    icon: require("../../assets/icons/allergies.png"),
    code: IpsSectionCode.Devices.code,
  },
] as const;

export function IpsSectionTile(props: {
  onPress: () => void;
  tile: Tile;
  selected: boolean;
}) {
  const theme = useColorScheme();
  const palette = getPalette(theme === "dark");
  const { selected, onPress, tile } = props;
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: !selected
            ? palette.background
            : palette.secondary.lighter,
          borderColor: !selected
            ? palette.primary.lighter
            : palette.secondary.dark,
        },
        cardStyles.card,
      ]}
      onPress={onPress}
    >
      <Image source={tile.icon} style={cardStyles.image} />
      <Text style={[cardStyles.title, { color: palette.primary.main }]}>
        {tile.label}
      </Text>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 8,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
  },
});
