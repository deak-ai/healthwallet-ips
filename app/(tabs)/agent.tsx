import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { View } from '@/components/Themed';

const AGENT_URL = 'https://agent.healthwallet.li';

export default function AgentScreen() {
    return (
        <View style={styles.container}>
            <WebView 
                source={{ uri: AGENT_URL }}
                style={styles.webview}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                javaScriptEnabled={true}
                originWhitelist={['*']}
                allowFileAccess
                allowsProtectedMedia={true}
                domStorageEnabled={true}
                mediaCapturePermissionGrantType="grant"
                allowsBackgroundMediaPlayback={true}
                allowsAirPlayForMediaPlayback={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
        width: '100%',
    },
});
