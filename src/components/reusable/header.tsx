import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@/components/MultiSourceIcon";
import { getPalette } from "@/constants/Colors";
import { useColorScheme } from "react-native";

interface HeaderProps {
  title: string;
  onBack?: () => void;  
}

const Header: React.FC<HeaderProps> = ({ title, onBack }) => {
  const navigation = useNavigation();
  const theme = useColorScheme() ?? "light";
  const palette = getPalette(theme === "dark");

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Icon
          type="ionicon"
          name="chevron-back-circle-outline"
          size={32}
          color={theme === "dark" ? palette.neutral.white : palette.neutral.black}
        />
      </TouchableOpacity>
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
});

export default Header;