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

// palette.ts

export interface ColorShades {
  main: string;
  light: string;
  dark?: string;
  lighter?: string;
}

export interface NeutralColors {
  black: string;
  white: string;
  grey: string;
  red: string;
}

export interface ColorPalette {
  primary: ColorShades;
  secondary: ColorShades;
  neutral: NeutralColors;
  background: string;
  text: string;
}

export const lightPalette: ColorPalette = {
  primary: {
    main: "#5A81FA",
    light: "#CDDEFF",
    lighter: "#2E6FF31A",
    dark: "#2B318A",
  },
  secondary: {
    main: "#2C3D8F",
    light: "#CEE5FF",
  },
  neutral: {
    black: "#000000",
    white: "#ffffff",
    grey: "#1D1D1F",
    red: "#CD3F3E",
  },
  background: "#ffffff",
  text: "#000000",
};

export const darkPalette: ColorPalette = {
  primary: {
    main: "#bb86fc",
    light: "#efb7ff",
    lighter: "#2E6FF31A",
    dark: "#2B318A",
  },
  secondary: {
    main: "#03dac6",
    light: "#CEE5FF",
  },
  neutral: {
    black: "#000000",
    white: "#ffffff",
    grey: "#1D1D1F",
    red: "#CD3F3E",
  },
  background: "#121212",
  text: "#ffffff",
};

export const getPalette = (isDarkMode: boolean): ColorPalette =>
  isDarkMode ? darkPalette : lightPalette;
