import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import { useThemeColor } from '@/components/Themed';
import Colors from "@/constants/Colors";

interface FhirBoxProps {
    name: string;
    onPress: () => void;
}

const FhirBox: React.FC<FhirBoxProps> = ({ name, onPress }) => {
    const backgroundColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');
    const borderColor = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, 'border');
    const textColor = useThemeColor({ light: Colors.light.text, dark: Colors.dark.text }, 'text');

    return (
        <Pressable onPress={onPress} style={({ pressed }) => [styles.container, { backgroundColor, borderColor }, pressed && styles.pressed]}>
            <Text style={[styles.text, { color: textColor }]}>{name}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
        marginVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
    },
    pressed: {
        opacity: 0.7,
    },
});

export default FhirBox;