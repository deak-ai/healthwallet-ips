// components/IpsSectionTile.tsx

import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Text, useThemeColor } from '@/components/Themed';
import { IconType, Icon } from '@/components/MultiSourceIcon';
import Colors from '@/constants/Colors';

// Define a type for the tiles array
export type Tile = {
    id: number;
    label: string;
    icon: string;
    type: IconType;
    code: string;
};

export function IpsSectionTile(props: { onPress: () => void; tile: Tile }) {
    const backgroundColor = useThemeColor({ light: Colors.light.background, dark: Colors.dark.background }, 'background');
    const borderColor = useThemeColor({ light: Colors.light.border, dark: Colors.dark.border }, 'border');
    const iconColor = useThemeColor({ light: Colors.light.icon, dark: Colors.dark.icon }, 'icon');
    return (
        <Pressable
            style={[styles.tile, { backgroundColor, borderColor }]}
            onPress={props.onPress}
        >
            <Icon type={props.tile.type} name={props.tile.icon} size={32} color={iconColor} />
            <Text style={styles.tileLabel}>{props.tile.label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        width: '45%', // Two tiles per row
        aspectRatio: 1, // Make tiles square
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderRadius: 10,
        borderWidth: 1, // Add border width to handle contour
        elevation: 2, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
    },
    tileLabel: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '500',
    },
});