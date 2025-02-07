import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, useColorScheme, TouchableOpacity } from "react-native";
import { Text, View, TextInput } from "@/components/Themed";
import { useNavigation } from "expo-router";
import CustomLoader from "@/components/reusable/loader";
import { useWalletConfiguration } from "@/components/WalletConfigurationContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPalette } from "@/constants/Colors";
import Header from "@/components/reusable/header";
import BottomSheet from "@/components/reusable/bottomSheet";
import Toast from "react-native-toast-message";

interface Credentials {
  username: string;
  password: string;
}

export default function SettingsWallet() {
  const [usernameValue, setUsernameValue] = useState<string>("");
  const [passwordValue, setPasswordValue] = useState<string>("");
  const theme = useColorScheme() ?? "light";
  const refRBSheet = useRef<any>(null);
  const palette = getPalette(theme === "dark");
  const navigation = useNavigation();
  const {
    username,
    password,
    saveWalletCredentials,
    testWalletConnection,
    isWalletConfigured,
    isLoading,
  } = useWalletConfiguration();

  const disabledTestConnection = !usernameValue || !passwordValue;

  useEffect(() => {
      setUsernameValue(username || "");
      setPasswordValue(password || "");
    }, [username, password]);

  useEffect(() => {
    if (!isWalletConfigured && !isLoading && refRBSheet?.current?.open) {
      refRBSheet.current?.open();
    }
  }, [isWalletConfigured, isLoading]);

  const handleSave = async () => {
      await saveWalletCredentials(usernameValue, passwordValue);
  };

  const handleTest = async () => {
    if (!usernameValue || !passwordValue) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter both username and password",
        position: "bottom",
      });
      return;
    }

    try {
      // First save the credentials so they're in context
      await saveWalletCredentials(usernameValue, passwordValue);
      // Then test the connection
      const isValid = await testWalletConnection();
      
      if (!isValid) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Connection test failed. Please check your credentials.",
          position: "bottom",
        });
      }
    } catch (error) {
      console.error("Error testing wallet connection:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to test connection. Please try again.",
        position: "bottom",
      });
    }
  };

  const handleBack = () => {
    // Get the previous route name from navigation state
    const state = navigation.getState();
    const previousRoute = state?.routes[state.routes.length - 2]?.name;
    
    // If coming from ips tab and not configured, prevent navigation
    if (previousRoute === '(tabs)' && !isWalletConfigured) {
      return;
    }
    
    // Otherwise, allow normal back navigation
    navigation.goBack();
  };


  const handleUsernameChange = (text: string) => {
    setUsernameValue(text);
  };

  const handlePasswordChange = (text: string) => {
    setPasswordValue(text);
  };

  // Debug focus handling
  const handleInputFocus = (inputName: string) => {
    console.log(`${inputName} input focused`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header title={"Wallet Settings"} onBack={handleBack} />

        <Text style={[styles.label, { color: palette.text }]}>Username:</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme === "light" ? palette.secondary.light : palette.neutral.white,
              color: palette.text,
              backgroundColor: theme === "light" ? palette.neutral.white : palette.neutral.black,
            },
          ]}
          placeholder="Enter username"
          placeholderTextColor={palette.text}
          value={usernameValue}
          onChangeText={handleUsernameChange}
          onFocus={() => handleInputFocus('username')}
          editable={true}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={[styles.label, { color: palette.text }]}>Password:</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: theme === "light" ? palette.secondary.light : palette.neutral.white,
              color: palette.text,
              backgroundColor: theme === "light" ? palette.neutral.white : palette.neutral.black,
            },
          ]}
          placeholder="Enter password"
          placeholderTextColor={palette.text}
          value={passwordValue}
          secureTextEntry
          onChangeText={handlePasswordChange}
          onFocus={() => handleInputFocus('password')}
          editable={true}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.buttonContainer}>
          

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: theme === "dark" ? palette.primary.main : palette.secondary.main,
                opacity: disabledTestConnection ? 0.5 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={disabledTestConnection || isLoading}
          >
            <Text style={[styles.buttonText, { color: palette.neutral.white }]}>
              Save Credentials
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && <CustomLoader variant="overlay" />}

        <BottomSheet
          ref={refRBSheet}
          title="Wallet Configuration Required"
          description="Please configure valid wallet credentials."
        />
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
    padding: 20,
    backgroundColor: "transparent",
    gap: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    height: 44,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    paddingHorizontal: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
