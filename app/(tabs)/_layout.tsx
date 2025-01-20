import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {Tabs} from 'expo-router';

import Colors from '@/constants/Colors';
import {useColorScheme} from '@/components/useColorScheme';
import {useClientOnlyValue} from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{marginBottom: -3}} {...props} />;
}

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                // Disable the static render of the header on web
                // to prevent a hydration error in React Navigation v6.
                headerShown: useClientOnlyValue(false, true),
                headerPressColor:Colors[colorScheme ?? 'light'].tint,
                tabBarActiveBackgroundColor:Colors[colorScheme ?? 'light'].selected,
                tabBarInactiveTintColor:Colors[colorScheme ?? 'light'].tint,
                tabBarIconStyle:{color:Colors[colorScheme ?? 'light'].tint},
                tabBarInactiveBackgroundColor:Colors[colorScheme ?? 'light'].tabBarBackground
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({color}) => <TabBarIcon name="ambulance" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="ips"
                options={{
                    title: 'International',
                    tabBarIcon: ({color}) => <TabBarIcon name="medkit" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="wallet"
                options={{
                    title: 'Wallet',
                    tabBarIcon: ({color}) => <TabBarIcon name="shopping-bag" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="agent"
                options={{
                    title: 'Agent',
                    tabBarIcon: ({color}) => <TabBarIcon name="music" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({color}) => <TabBarIcon name="gear" color={color}/>,
                }}
            />

        </Tabs>
    );
}
