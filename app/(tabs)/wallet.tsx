import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { View, Text } from '@/components/Themed';

import { useOneCore } from '@/components/OneContext';
import { Version, Config } from '@procivis/react-native-one-core';

export default function WalletScreen() {
    const { oneCore } = useOneCore();
    const [version, setVersion] = useState<Version | undefined>();
    const [config, setConfig] = useState<Config | undefined>();

    useEffect(() => {
        async function getVersion() {
            if (oneCore) {
                const ver = await oneCore.getVersion();
                setVersion(ver);
                const cfg = await oneCore.getConfig();
                setConfig(cfg);
            }
        }
        getVersion();
    }, [oneCore]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.content}>
                <Text>Version: {JSON.stringify(version, null, 2)}</Text>
                <Text style={styles.spacer}>Config: {JSON.stringify(config, null, 2)}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    content: {
        padding: 20,
    },
    spacer: {
        marginTop: 20,
    },
});