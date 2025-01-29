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
  lightGrey:string
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
    dark: "#2E6FF3",
    lighter: "#2E6FF314",
  },
  neutral: {
    black: "#000000",
    white: "#ffffff",
    grey: "#1D1D1F",
    red: "#CD3F3E",
    lightGrey:"#cccccc"
  },
  background: "#ffffff",
  text: "#000000",
};

export const darkPalette: ColorPalette = {
  primary: {
    main: "#5A81FA",
    light: "#CDDEFF",
    lighter: "#2E6FF31A",
    dark: "#2B318A",
  },
  secondary: {
    main: "#2C3D8F",
    dark: "#2E6FF3",
    light: "#CEE5FF",
    lighter: "#2E6FF314",
  },
  neutral: {
    black: "#000000",
    white: "#ffffff",
    grey: "#1D1D1F",
    red: "#CD3F3E",
    lightGrey:"#cccccc"
  },
  background: "#121212",
  text: "#ffffff",
};

export const getPalette = (isDarkMode: boolean): ColorPalette =>
  isDarkMode ? darkPalette : lightPalette;
