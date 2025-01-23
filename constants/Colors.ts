// constants/Colors.ts

const tintColorLight = "#2563EA";
const tintColorDark = "#fff";

const lightColors = {
  text: "#000", // Black text in light mode
  background: "#fff", // White background in light mode
  tint: tintColorLight,
  tabIconDefault: "#ccc",
  tabIconSelected: tintColorLight,
  border: "#ccc", // Light border
  icon: "#2563EA", // green icon in light mode
  placeholder: "#888", // Light input placeholder,
  selected: "#2563EA2B",
  tabBarBackground: "#fff",
  cardBackground: "#fff",
  label: "#000",
  tileBackground: "#CEE5FF",
};

const darkColors = {
  text: "#fff", // White text in dark mode
  background: "#000", // Black background in dark mode
  tint: tintColorDark,
  tabIconDefault: "#ccc",
  tabIconSelected: tintColorDark,
  border: "#fff", // White border
  icon: "#2563EA", // White icon in dark mode
  placeholder: "#aaa", // Dark input placeholder,
  selected: "#0573F02B",
  tabBarBackground: "#2563EA",
  cardBackground: "#2563EA26",
  label: "#fff",
  tileBackground: "#2563EA26",
};

export default {
  light: lightColors,
  dark: darkColors,
};
