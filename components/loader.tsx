import { getPalette } from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  useColorScheme,
} from "react-native";

const CustomLoader = () => {
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
    <View style={styles.container}>
      <View
        style={[styles.circle, { backgroundColor: palette.secondary.light }]}
      >
        <Animated.Image
          source={require("../assets/images/loader.png")}
          style={[styles.image, { transform: [{ rotate }] }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default CustomLoader;
