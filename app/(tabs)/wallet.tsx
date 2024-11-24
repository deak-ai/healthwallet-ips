import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { View } from '@/components/Themed';

// You can make this URL configurable through your settings or environment variables
const WALLET_URL = 'https://webdev.healthwallet.li';

export default function WalletScreen() {
    return (
        <View style={styles.container}>
            <WebView 
                source={{ uri: WALLET_URL }}
                style={styles.webview}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}   // Allows inline video on iOS
                javaScriptEnabled={true}
                originWhitelist={['*']}
                allowFileAccess
                allowsProtectedMedia={true}        // Required for media access
                domStorageEnabled={true}

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
    },
}); 