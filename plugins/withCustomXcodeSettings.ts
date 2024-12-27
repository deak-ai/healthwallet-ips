import { ConfigPlugin, withXcodeProject } from '@expo/config-plugins';

const withCustomXcodeSettings: ConfigPlugin = (config) => {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;

    // Locate all build configurations
    Object.values(project.pbxXCBuildConfigurationSection()).forEach((buildConfig: any) => {
      if (typeof buildConfig.buildSettings !== 'undefined') {
        // Add or modify the build setting
        buildConfig.buildSettings.ENABLE_USER_SCRIPT_SANDBOXING = 'NO';
      }
    });

    return config;
  });
};

export default withCustomXcodeSettings;
