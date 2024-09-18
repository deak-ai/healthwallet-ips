// constants/Colors.ts

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const lightColors = {
  text: '#000',  // Black text in light mode
  background: '#fff',  // White background in light mode
  tint: tintColorLight,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColorLight,
  border: '#ccc',  // Light border
  icon: '#000',  // Black icon in light mode
  placeholder: '#888',  // Light input placeholder
};

const darkColors = {
  text: '#fff',  // White text in dark mode
  background: '#000',  // Black background in dark mode
  tint: tintColorDark,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColorDark,
  border: '#fff',  // White border
  icon: '#fff',  // White icon in dark mode
  placeholder: '#aaa',  // Dark input placeholder
};

export default {
  light: lightColors,
  dark: darkColors,
};