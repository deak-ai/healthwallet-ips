import React from "react";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

const CustomToast = () => {
  const toastConfig: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "#154E47", backgroundColor: "#B7E0E1" }}
        text1Style={{
          fontSize: 15,
          fontWeight: "bold",
          color: "#154E47",
        }}
        text2Style={{
          fontSize: 13,
          fontWeight: "bold",
          color: "#154E47",
        }}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: "#CD3F3E", backgroundColor: "#CD3F3E" }}
        text1Style={{
          fontSize: 18,
          fontWeight: "bold",
          color:"white"
        }}
        text2Style={{
          fontSize: 15,
          fontWeight: "bold",
          color: "white",
        }}
      />
    ),
  };

  return <Toast config={toastConfig} />;
};

export default CustomToast;
