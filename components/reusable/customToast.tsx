import { getPalette } from "@/constants/Colors";
import React from "react";
import { useColorScheme } from "react-native";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

const CustomToast = () => {
  const theme = useColorScheme() ?? "light";
  const palette = getPalette(theme === "dark");

  const toastConfig: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: palette.primary.main,
          backgroundColor: palette.secondary.light,
        }}
        text1Style={{
          fontSize: 15,
          fontWeight: "bold",
          color: palette.secondary.main,
        }}
        text2Style={{
          fontSize: 13,
          fontWeight: "bold",
          color: palette.secondary.main,
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: palette.neutral.red,
          backgroundColor: palette.neutral.red,
        }}
        text1Style={{
          fontSize: 18,
          fontWeight: "bold",
          color: palette.neutral.white,
        }}
        text2Style={{
          fontSize: 15,
          fontWeight: "bold",
          color: palette.neutral.white,
        }}
      />
    ),
  };

  return <Toast config={toastConfig} />;
};

export default CustomToast;
