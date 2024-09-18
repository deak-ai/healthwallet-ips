import React from 'react';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';

// Define available icon types
type IconType = 'ionicon' | 'fontawesome6';

interface IconProps {
    type: IconType;
    name: string;
    size?: number;
    color?: string;
}

const Icon: React.FC<IconProps> = ({ type, name, size = 24, color = 'black' }) => {
    switch (type) {
        case 'ionicon':
            return <Ionicons name={name as keyof typeof Ionicons.glyphMap} size={size} color={color} />;
       case 'fontawesome6':
            return <FontAwesome6 name={name as keyof typeof FontAwesome6.glyphMap} size={size} color={color} />;
        default:
            return null;
    }
};

export default Icon;
