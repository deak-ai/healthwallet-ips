import React, { useState } from "react";

import { Text, View, TouchableOpacity } from "react-native";

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

  const updatedSwitchData = (val: number) => {
    onSelectSwitch(val);
  };

  return (
    <View>
      <View
        style={{
          height: 44,
          width: 215,
          backgroundColor: "white",
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

            backgroundColor: selectionMode == 1 ? selectionColor : "white",
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: selectionMode == 1 ? "white" : selectionColor,
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

            backgroundColor: selectionMode == 2 ? selectionColor : "white",
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: selectionMode == 2 ? "white" : selectionColor,
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
