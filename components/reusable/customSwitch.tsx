import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CustomSwitchProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  text: string;
  onToggle?: (isEnabled: boolean) => void;
  activeColor: string;
  inactiveColor: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  icon,
  iconActive,
  text,
  onToggle,
  activeColor,
  inactiveColor,
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const toggleSwitch = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          { color: isEnabled ? activeColor : inactiveColor },
        ]}
      >
        {text}
      </Text>

      <TouchableOpacity
        onPress={toggleSwitch}
        style={[
          styles.switchContainer,
          {
            backgroundColor: isEnabled ? activeColor : inactiveColor,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: "white",
              transform: [{ translateX: isEnabled ? 30 : 0 }],
            },
          ]}
        >
          <Ionicons
            name={isEnabled ? iconActive : icon}
            size={30}
            color={isEnabled ? activeColor : inactiveColor}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    marginRight: 10,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    borderRadius: 20,
    position: "absolute",
    left: 1,
  },
  switchContainer: {
    width: 60,
    height: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CustomSwitch;
