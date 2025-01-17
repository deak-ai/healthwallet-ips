// constants/Colors.ts

const tintColorLight = '#248479';
const tintColorDark = '#fff';

const lightColors = {
  text: '#000',  // Black text in light mode
  background: '#fff',  // White background in light mode
  tint: tintColorLight,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColorLight,
  border: '#ccc',  // Light border
  icon: '#248479',  // green icon in light mode
  placeholder: '#888',  // Light input placeholder,
  selected:"#2484792B",
};

const darkColors = {
  text: '#fff',  // White text in dark mode
  background: '#000',  // Black background in dark mode
  tint: tintColorDark,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColorDark,
  border: '#fff',  // White border
  icon: '#fff',  // White icon in dark mode
  placeholder: '#aaa',  // Dark input placeholder,
  selected:"#2484792B"
};

export default {
  light: lightColors,
  dark: darkColors,
};