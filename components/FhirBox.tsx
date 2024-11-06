import React from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
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
            <View style={styles.textContainer}>
                <Text style={[styles.text, { color: textColor }]}>{name}</Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
        marginVertical: 5,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    textContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    text: {
        fontSize: 16
    },
    pressed: {
        opacity: 0.7,
    },
});

export default FhirBox;