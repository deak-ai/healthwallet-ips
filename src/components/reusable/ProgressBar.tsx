import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { getPalette } from '@/constants/Colors';

interface ProgressBarProps {
  progress: number; // Value between 0 and 1
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const theme = useColorScheme() ?? 'light';
  const palette = getPalette(theme === 'dark');
  const isDark = theme === 'dark';

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? palette.neutral.black : palette.neutral.lightGrey,
        }
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
            backgroundColor: isDark ? palette.primary.light : palette.primary.main,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 8,
  },
  bar: {
    height: '100%',
  },
});

export default ProgressBar;
