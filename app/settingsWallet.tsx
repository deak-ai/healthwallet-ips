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
import { SafeAreaView } from "react-native-safe-area-context";

interface Credentials {
  username: string;
  password: string;
}

export default function SettingsWallet() {
  const [credentials, setCredentials] = useState<Credentials>({
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
        } catch (error) {
          console.error("Error loading credentials:", error);
        }
      };
      loadCredentials();
    }, [])
  );

  const saveCredentials = async () => {
    try {
      await SecureStore.setItemAsync("username", credentials.username);
      await SecureStore.setItemAsync("password", credentials.password);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Data saved successfully",
        position: "bottom",
      });
    } catch (error) {
      console.error("Error saving credentials:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save data",
        position: "bottom",
      });
    }
  };

  const testConnection = async () => {
    if (!credentials.username || !credentials.password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter both username and password",
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting to connect with username:', credentials.username);
      
      const walletApi = new WaltIdWalletApi(
        "https://wallet.healthwallet.li",
        credentials.username,
        credentials.password
      );

      const data = await walletApi.login();
      
      if (data.token) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Login Successful",
          position: "bottom",
        });
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Login error details:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = "Failed to login. Please check your credentials.";
      if (error instanceof Error) {
        if ((error as any).status === 401) {
          errorMessage = "Invalid username or password";
        } else if (error.message.includes("undefined")) {
          errorMessage = "Invalid credentials format. Please check your username and password.";
        }
      }
      
      Toast.show({
        type: "error",
        text1: "Failed to connect",
        text2: errorMessage,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  const onChangeField = (value: string, name: keyof Credentials) => {
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
          value={credentials.username}
          onChangeText={(value) => onChangeField(value, "username")}
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
          value={credentials.password}
          onChangeText={(value) => onChangeField(value, "password")}
          secureTextEntry={true}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme === "dark" ? palette.primary.main : palette.secondary.main,
              }
            ]}
            onPress={saveCredentials}
          >
            <Text style={[styles.buttonText, { color: palette.neutral.white }]}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: !disabledTestConnection
                  ? theme === "dark" ? palette.primary.main : palette.secondary.main
                  : palette.neutral.lightGrey,
                opacity: disabledTestConnection ? 0.5 : 1,
              },
            ]}
            onPress={testConnection}
            disabled={disabledTestConnection}
          >
            <Text 
              style={[
                styles.buttonText, 
                { 
                  color: !disabledTestConnection ? palette.neutral.white : palette.neutral.black 
                }
              ]}
            >
              Test connection
            </Text>
          </TouchableOpacity>
        </View>
        {loading && <CustomLoader />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
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
