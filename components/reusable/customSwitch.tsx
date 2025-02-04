import React from "react";
import { Text, View, TouchableOpacity, useColorScheme } from "react-native";
import { getPalette } from "@/constants/Colors";

interface CustomSwitchProps {
  selectionMode: number;
  option1: string;
  option2: string;
  onSelectSwitch: (val: number) => void;
  selectionColor: string;
}

const CustomSwitch = ({
  selectionMode,
  option1,
  option2,
  onSelectSwitch,
  selectionColor,
}: CustomSwitchProps) => {
  const theme = useColorScheme() ?? "light";
  const palette = getPalette(theme === "dark");

  const updatedSwitchData = (val: number) => {
    onSelectSwitch(val);
  };

  return (
    <View>
      <View
        style={{
          height: 44,
          width: 215,
          backgroundColor: palette.background,
          borderRadius: 25,
          borderWidth: 1,
          borderColor: selectionColor,
          flexDirection: "row",
          justifyContent: "center",
          padding: 2,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => updatedSwitchData(1)}
          style={{
            flex: 1,
            backgroundColor: selectionMode == 1 ? selectionColor : palette.background,
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: selectionMode == 1 ? palette.neutral.white : selectionColor,
            }}
          >
            {option1}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => updatedSwitchData(2)}
          style={{
            flex: 1,
            backgroundColor: selectionMode == 2 ? selectionColor : palette.background,
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: selectionMode == 2 ? palette.neutral.white : selectionColor,
            }}
          >
            {option2}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default CustomSwitch;
