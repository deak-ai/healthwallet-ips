import React from 'react';
import {Ionicons, FontAwesome6} from '@expo/vector-icons';

// Define available icon types
export type IconType = 'ionicon' | 'fontawesome6';

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
        case 'ionicon':
            return <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size} color={color}/>;
        case 'fontawesome6':
            return <FontAwesome6 name={name as keyof typeof FontAwesome6.glyphMap} size={size} color={color}/>;
        default:
            return null;
    }
};

export {Icon};

