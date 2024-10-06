import React from 'react';
import {Ionicons, FontAwesome5, FontAwesome6, MaterialIcons} from '@expo/vector-icons';

// Define available icon types
export type IconType =  'fontawesome5'| 'fontawesome6' | 'ionicon' | 'materialicons';

interface IconProps {
    type: IconType;
    name: string;
    size?: number;
    color?: string;
}

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = 'black';

const Icon = ({type, name, size = DEFAULT_SIZE, color = DEFAULT_COLOR}: IconProps) => {
    switch (type) {
        case 'fontawesome5':
            return <FontAwesome5 name={name as keyof typeof FontAwesome5.glyphMap} size={size} color={color}/>;
        case 'fontawesome6':
            return <FontAwesome6 name={name as keyof typeof FontAwesome6.glyphMap} size={size} color={color}/>;
        case 'ionicon':
            return <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size} color={color}/>;
        case 'materialicons':
            return <MaterialIcons name={name as keyof typeof MaterialIcons.glyphMap} size={size} color={color}/>;
        default:
            return null;
    }
};

export {Icon};

