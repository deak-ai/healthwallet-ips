/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText,
  View as DefaultView,
  TextInput as DefaultTextInput,
} from "react-native";

import  { getPalette } from "@/constants/Colors";
import { useColorScheme } from "./useColorScheme";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];
export type TextInputProps = ThemeProps & DefaultTextInput["props"];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const theme = useColorScheme() ?? "light";
  const palette = getPalette(theme === "dark");
  const color = palette.text;

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const theme = useColorScheme() ?? 'light';
  const palette=getPalette(theme==="dark")

  return <DefaultView style={[{ backgroundColor:palette.background }, style]} {...otherProps} />;
}

export function TextInput(props: TextInputProps) {
  const { style, lightColor, darkColor, placeholderTextColor, ...otherProps } =
    props;
    const theme = useColorScheme() ?? 'light';
    const palette=getPalette(theme==="dark")

  const backgroundColor = palette.background
  const borderColor = palette.secondary.light

  const color = palette.text;
  const finalPlaceholderTextColor =
    placeholderTextColor ??
    palette.neutral.grey;

  return (
    <DefaultTextInput
      style={[{ backgroundColor, borderColor, color }, style]}
      placeholderTextColor={finalPlaceholderTextColor}
      {...otherProps}
    />
  );
}
