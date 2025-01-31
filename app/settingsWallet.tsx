import React, { useState } from "react";
import { StyleSheet, useColorScheme, TouchableOpacity } from "react-native";
import { Text, View, TextInput } from "@/components/Themed";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "expo-router";
import CustomLoader from "@/components/reusable/loader";
import Toast from "react-native-toast-message";
import { getPalette } from "@/constants/Colors";
import Header from "@/components/reusable/header";
import { WaltIdWalletApi } from "@/components/waltIdWalletApi";

interface Credentials {
  username: string;
  password: string;
}

export default function SettingsWallet() {
  const [credentials, setCredentials] = useState<Credentials>({
    username: "",
    password: "",
  });
  const [inputValue, setInputValue] = useState<Credentials>({
    username: "",
    password: "",
  });
  const theme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(false);
  const palette = getPalette(theme === "dark");

  const disabledTestConnection = !credentials.username || !credentials.password;

  useFocusEffect(
    React.useCallback(() => {
      const loadCredentials = async () => {
        try {
          const savedUsername = await SecureStore.getItemAsync("username");
          const savedPassword = await SecureStore.getItemAsync("password");
          setCredentials({
            username: savedUsername || "",
            password: savedPassword || "",
          });
          setInputValue({
            username: savedUsername || "",
            password: savedPassword || "",
          });
        } catch (error) {
          console.error("Error loading patient ID:", error);
        }
      };
      (async () => {
        await loadCredentials();
      })();
    }, [])
  );

  const saveCredentials = async () => {
    try {
      await SecureStore.setItemAsync("username", inputValue.username);
      await SecureStore.setItemAsync("password", inputValue.password);
      setCredentials({
        username: inputValue.username,
        password: inputValue.password,
      });

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Data saved successfully",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error saving patient ID:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save data",
        position: "bottom",
      });
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      const walletApi = new WaltIdWalletApi(
        "https://wallet.healthwallet.li",
        credentials.username,
        credentials.password
      );
      await walletApi
        .login()
        .then((data) => {
          if (data.token) {
            Toast.show({
              type: "success",
              text1: "Success",
              text2: "Login Successful",
              position: "bottom",
            });
          } else {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to login.",
              position: "bottom",
            });
          }
        })
        .catch((error) => {
          console.error("Error login:", error);
        });
    } catch (error) {
      console.error("Error login:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to login.",
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const onChangeField = (value: string, name: string) => {
    setInputValue((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <View style={styles.container}>
      <Header title="Wallet" />
      <Text style={styles.label}>Enter Wallet credentials:</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor:
              theme === "light"
                ? palette.secondary.light
                : palette.neutral.white,
          },
        ]}
        placeholder="Username"
        value={inputValue.username}
        onChangeText={(value) => {
          onChangeField(value, "username");
        }}
      />

      <TextInput
        style={[
          styles.input,
          {
            borderColor:
              theme === "light"
                ? palette.secondary.light
                : palette.neutral.white,
          },
        ]}
        placeholder="Password"
        value={inputValue.password}
        onChangeText={(value) => {
          onChangeField(value, "password");
        }}
        secureTextEntry={true}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: palette.secondary.light }]}
          onPress={saveCredentials}
        >
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: !disabledTestConnection
                ? palette.secondary.light
                : palette.neutral.lightGrey,
              opacity: disabledTestConnection ? 0.5 : 1,
            },
          ]}
          onPress={testConnection}
        >
          <Text style={styles.buttonText} disabled={disabledTestConnection}>
            Test connection
          </Text>
        </TouchableOpacity>
      </View>
      {loading && <CustomLoader />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
    gap: 18,
    padding: 10,
  },
  label: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    height: 60,
    borderWidth: 1,
    width: "90%",
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 6,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    padding: 12,
    width: "100%",
    gap: 20,
  },
  button: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 10,
  },
});
