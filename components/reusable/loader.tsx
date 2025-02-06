import { getPalette } from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  useColorScheme,
} from "react-native";

interface CustomLoaderProps {
  variant?: 'initial' | 'overlay';
}

const CustomLoader = ({ variant = 'overlay' }: CustomLoaderProps) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const theme = useColorScheme() ?? "light";
  const palette = getPalette(theme === "dark");

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View 
        style={[
          styles.background, 
          { 
            backgroundColor: theme === "dark" ? "#000000" : "#FFFFFF",
            opacity: variant === 'initial' ? 1 : theme === "dark" ? 0.85 : 0.7,
          }
        ]} 
      />
      <View style={styles.container}>
        <View style={[styles.circle, { backgroundColor: palette.secondary.light }]}>
          <Animated.Image
            source={require("../../assets/images/loader.png")}
            style={[styles.image, { transform: [{ rotate }] }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000, 
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default CustomLoader;
