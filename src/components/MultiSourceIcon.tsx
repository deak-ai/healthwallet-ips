import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import {Ionicons, FontAwesome, FontAwesome5, FontAwesome6, MaterialIcons} from '@expo/vector-icons';

// Define available icon types
export type IconType = 'fontawesome' | 'fontawesome5'| 'fontawesome6' | 'ionicon' | 'materialicons';

interface IconProps {
    type: IconType;
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
}

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = 'black';

const Icon = ({type, name, size = DEFAULT_SIZE, color = DEFAULT_COLOR, style}: IconProps) => {
    switch (type) {
        case 'fontawesome':
            return <FontAwesome name={name as keyof typeof FontAwesome.glyphMap} size={size} color={color} style={style}/>;
        case 'fontawesome5':
            return <FontAwesome5 name={name as keyof typeof FontAwesome5.glyphMap} size={size} color={color} style={style}/>;
        case 'fontawesome6':
            return <FontAwesome6 name={name as keyof typeof FontAwesome6.glyphMap} size={size} color={color} style={style}/>;
        case 'ionicon':
            return <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size} color={color} style={style}/>;
        case 'materialicons':
            return <MaterialIcons name={name as keyof typeof MaterialIcons.glyphMap} size={size} color={color} style={style}/>;
        default:
            return null;
    }
};

export {Icon};
