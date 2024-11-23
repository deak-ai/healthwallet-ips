import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View } from '@/components/Themed';
import { useIpsData } from '@/components/IpsDataContext';
import { filterResourceWrappers, getFlattenedIpsSections } from '@/components/ipsResourceProcessor';
import { IpsSectionCode } from '@/components/fhirIpsModels';
import fhirpath from "fhirpath";

const AGENT_URL = 'https://agent.healthwallet.li';

// This is the custom prompt that will be injected
let SYSTEM_PROMPT = `NO HEALTH DATA FOUND`;
let FIRST_MESSAGE = `Hello!`;

export default function AgentScreen() {
    const webViewRef = useRef<WebView>(null);

    const { ipsData } = useIpsData();

    if (ipsData) {
        const ipsRequiredData = getFlattenedIpsSections(ipsData, [
            IpsSectionCode.Allergies,
            IpsSectionCode.Medications,
            IpsSectionCode.Problems
        ]);
        SYSTEM_PROMPT = JSON.stringify(ipsRequiredData);

        const patientName = fhirpath.evaluate(ipsData?.resources[0].resource,
            "Patient.name.where(use='official').given.first()")

        FIRST_MESSAGE = `Hello ${patientName}`
    }

    // Function to inject the prompt
    const injectPrompt = () => {
        const healthAgentData = {
            prompt: SYSTEM_PROMPT,
            firstMessage: FIRST_MESSAGE
        };
       
        const injectedJavaScript = `
            console.log = function() {
                const args = Array.from(arguments).map(arg => {
                    if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                    }
                    return String(arg);
                });
                window.ReactNativeWebView.postMessage('LOG: ' + args.join(' '));
            };

            window.healthAgentData = ${JSON.stringify(healthAgentData)};
            true;
        `;
        webViewRef.current?.injectJavaScript(injectedJavaScript);
    };

    // Handle messages from WebView
    const onMessage = (event: WebViewMessageEvent) => {
        console.log('Message from webview:', event.nativeEvent.data);
    };

    // Inject script when page loads
    const onLoadEnd = () => {
        injectPrompt();
    };

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
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
                allowsAirPlayForMediaPlayback={true}
                onLoadEnd={onLoadEnd}
                onMessage={onMessage}
                onLoadStart={() => console.log('WebView load started')}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn(
                        `WebView received error status code: ${nativeEvent.statusCode}`,
                        nativeEvent.description
                    );
                }}
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
