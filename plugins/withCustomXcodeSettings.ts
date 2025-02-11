import { ConfigPlugin, withXcodeProject } from '@expo/config-plugins';

const withCustomXcodeSettings: ConfigPlugin = (config) => {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;

    // Locate all build configurations
    Object.values(project.pbxXCBuildConfigurationSection()).forEach((buildConfig: any) => {
      if (typeof buildConfig.buildSettings !== 'undefined') {
        // Add or modify the build settings
        buildConfig.buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
        
        // Add settings for react-native-fast-encoder
        if (buildConfig.buildSettings.PRODUCT_NAME === 'react-native-fast-encoder') {
          buildConfig.buildSettings.CLANG_CXX_LANGUAGE_STANDARD = 'gnu++17';
          buildConfig.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = '13.0';
          buildConfig.buildSettings.EXCLUDED_ARCHS = '';
          buildConfig.buildSettings.ENABLE_BITCODE = 'NO';
        }
      }
    });

    return config;
  });
};

export default withCustomXcodeSettings;
