import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, useColorScheme, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, View, TextInput } from "@/components/Themed";
import { useNavigation } from "expo-router";
import CustomLoader from "@/components/reusable/loader";
import { useWalletConfiguration } from "@/contexts/WalletConfigurationContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPalette } from "@/constants/Colors";
import Header from "@/components/reusable/header";
import BottomSheet from "@/components/reusable/bottomSheet";
import Toast from "react-native-toast-message";
import { useIpsData } from "@/contexts/IpsDataContext";
import ProgressBar from "@/components/reusable/ProgressBar";
import { HealthDataSyncManager, SyncProgress } from "@/components/HealthDataSync";
import { AntDesign } from '@expo/vector-icons';
import { useWalletShare } from "@/hooks/useWalletShare";

interface Credentials {
  username: string;
  password: string;
}

export default function SettingsWallet() {
  const [usernameValue, setUsernameValue] = useState<string>("");
  const [passwordValue, setPasswordValue] = useState<string>("");
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncManager, setSyncManager] = useState<HealthDataSyncManager | null>(null);
  const theme = useColorScheme() ?? "light";
  const refRBSheet = useRef<any>(null);
  const palette = getPalette(theme === "dark");
  const navigation = useNavigation();
  const {
    username,
    password,
    saveWalletCredentials,
    isWalletConfigured,
    isLoading,
  } = useWalletConfiguration();
  const { ipsData } = useIpsData();
  const { shareToWallet, queryCredentialsByCategory, sharePatient } = useWalletShare();

  const disabledSaveCredentials = !usernameValue || !passwordValue;

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


  const handleBack = () => {
    if (isSyncing) {
      Toast.show({
        type: 'error',
        text1: 'Sync in Progress',
        text2: 'Please abort the sync before navigating back',
        position: 'bottom',
        visibilityTime: 1000,
      });
      return;
    }
    
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

  const handleSync = async () => {
    if (!ipsData || isSyncing) return;
    
    setIsSyncing(true);
    setSyncProgress(null);
    
    const newSyncManager = new HealthDataSyncManager(
      (progress) => {
        setSyncProgress(progress);
      },
      shareToWallet,
      sharePatient,
      queryCredentialsByCategory
    );
    setSyncManager(newSyncManager);

    try {
      await newSyncManager.startSync(ipsData);
      Toast.show({
        type: 'success',
        text1: 'Sync Complete',
        text2: 'Health data has been successfully synchronized',
        position: 'bottom',
        visibilityTime: 1000,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Sync aborted') {
        Toast.show({
          type: 'success',
          text1: 'Sync Aborted',
          text2: 'Health data sync was cancelled',
          position: 'bottom',
          visibilityTime: 1000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Sync Failed',
          text2: 'Failed to synchronize health data',
          position: 'bottom',
          visibilityTime: 1000,
        });
      }
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
      setSyncManager(null);
    }
  };

  const handleAbort = () => {
    if (syncManager) {
      syncManager.abort();
    }
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
              },
            ]}
            onPress={handleSave}
            disabled={disabledSaveCredentials || isLoading}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: palette.neutral.white }]}>
              Save Credentials
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.syncButtonContent,
            {
              backgroundColor: theme === "dark" ? palette.primary.main : palette.secondary.main,
              marginTop: 16,
              marginHorizontal: 16,
            },
          ]}
          onPress={isSyncing ? handleAbort : handleSync}
          disabled={!isWalletConfigured || !ipsData}
          activeOpacity={0.8}
        >
          {isSyncing ? (
            <>
              <AntDesign 
                name="close" 
                size={20} 
                color={palette.neutral.white}
                style={styles.syncIcon}
              />
              <Text style={[styles.buttonText, { color: palette.neutral.white }]}>
                Abort Sync
              </Text>
            </>
          ) : (
            <>
              <AntDesign 
                name="sync" 
                size={20} 
                color={palette.neutral.white}
                style={styles.syncIcon}
              />
              <Text style={[styles.buttonText, { color: palette.neutral.white }]}>
                Health Data Sync
              </Text>
            </>
          )}
        </TouchableOpacity>

        {syncProgress && (
          <View style={styles.progressWrapper}>
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: palette.text }]}>
                Syncing {syncProgress.current} of {syncProgress.total} resources
              </Text>
              <ProgressBar progress={syncProgress.progress} />
            </View>
          </View>
        )}

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
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  syncButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncIcon: {
    marginRight: 8,
  },
  progressWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingBottom: 16,
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});
