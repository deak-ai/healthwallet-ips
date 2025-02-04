import 'ts-node/register'; // Add this to import TypeScript files
import { ExpoConfig } from 'expo/config';
import withCustomXcodeSettings from './plugins/withCustomXcodeSettings';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'ch.healthwallet.ips.dev';
  }

  if (IS_PREVIEW) {
    return 'ch.healthwallet.ips.preview';
  }

  return 'ch.healthwallet.ips';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'HealthWallet IPS (Dev)';
  }

  if (IS_PREVIEW) {
    return 'HealthWallet IPS (Preview)';
  }

  return 'HealthWallet IPS';
};


const config: ExpoConfig = {
  "name": getAppName(),
  "slug": "healthwallet-ips",
  "platforms": [
    "ios",
    "android"
  ],
  "version": "1.0.0",
  "orientation": "portrait",
  "icon": "./assets/images/icon.png",
  "scheme": "myapp",
  "userInterfaceStyle": "automatic",
  "splash": {
    "image": "./assets/images/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  },
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": getUniqueIdentifier(),
    "infoPlist": {
      "NSCameraUsageDescription": "This app requires camera access to enable video functionality within the WebView.",
      "NSMicrophoneUsageDescription": "This app requires microphone access to enable audio functionality within the WebView.",
      "NSPhotoLibraryUsageDescription": "This app requires photo library access to save and share images.",
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": false,
        "NSExceptionDomains": {
          "healthwallet.li": {
            "NSIncludesSubdomains": true,
            "NSExceptionAllowsInsecureHTTPLoads": false,
            "NSExceptionMinimumTLSVersion": "TLSv1.2"
          }
        }
      }
    }
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/images/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    },
    "package": getUniqueIdentifier(),
    "permissions": [
      "CAMERA",
      "RECORD_AUDIO",
      "MODIFY_AUDIO_SETTINGS",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "ACCESS_WIFI_STATE"
    ]
  },
  "web": {
    "bundler": "metro",
    "output": "static",
    "favicon": "./assets/images/favicon.png"
  },
  "plugins": [
    "expo-router",
    "expo-secure-store"
  ],
  "experiments": {
    "typedRoutes": true
  },
  "extra": {
    "router": {
      "origin": false
    },
    "eas": {
      "projectId": "1dcd6b1c-e929-456d-8ff0-5666c29af928"
    },
  },
  "owner": "deak-ai"
};

export default withCustomXcodeSettings(config);
