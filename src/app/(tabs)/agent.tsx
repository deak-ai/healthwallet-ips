import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { View, Text } from '@/components/Themed';
import { useIpsData } from '@/components/IpsDataContext';
import { getFlattenedIpsSections } from '@/services/fhir/ipsResourceProcessor';
import { IpsSectionCode } from '@/services/fhir/fhirIpsModels';
import fhirpath from "fhirpath";
import { useFocusEffect } from '@react-navigation/native';

const AGENT_URL = 'https://agent1.healthwallet.li';

// This is the custom prompt that will be injected
let SYSTEM_PROMPT = `NO HEALTH DATA FOUND`;
let FIRST_MESSAGE = `Hello!`;

export default function AgentScreen() {
    const webViewRef = useRef<WebView>(null);
    const { ipsData } = useIpsData();
    const [shouldLoad, setShouldLoad] = useState(true);

    // Handle focus/blur of the screen
    useFocusEffect(
        React.useCallback(() => {
            setShouldLoad(true);
            
            return () => {
                setShouldLoad(false);
                // Reset the prompts to initial state
                SYSTEM_PROMPT = 'NO HEALTH DATA FOUND';
                FIRST_MESSAGE = 'Hello!';
            };
        }, [])
    );

    useEffect(() => {
        if (!shouldLoad) return;

        let isSubscribed = true;

        // Initialize state
        if (isSubscribed && ipsData) {
            const ipsRequiredData = getFlattenedIpsSections(ipsData, [
                IpsSectionCode.Allergies,
                IpsSectionCode.Medications,
                IpsSectionCode.Problems
            ]);
            SYSTEM_PROMPT = JSON.stringify(ipsRequiredData);

            const patientName = fhirpath.evaluate(ipsData?.resources[0].resource,
                "Patient.name.where(use='official').given.first()")

            FIRST_MESSAGE = `Hello ${patientName}`;
        }

        return () => {
            isSubscribed = false;
        };
    }, [ipsData, shouldLoad]);

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

            console.error = function() {
                const args = Array.from(arguments).map(arg => {
                    if (typeof arg === 'object') {
                        return JSON.stringify(arg, null, 2);
                    }
                    return String(arg);
                });
                window.ReactNativeWebView.postMessage('ERROR: ' + args.join(' '));
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
            {shouldLoad ? (
                <WebView
                    ref={webViewRef}
                    source={{ uri: AGENT_URL }}
                    style={styles.webview}
                    onLoadEnd={onLoadEnd}
                    onMessage={onMessage}
                    // Common settings for both platforms
                    mediaPlaybackRequiresUserAction={false}
                    allowsInlineMediaPlayback={true}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mediaCapturePermissionGrantType="grant"
                    allowFileAccess={true}
                    
                    // iOS specific settings
                    allowsAirPlayForMediaPlayback={true}
                    allowsProtectedMedia={true}
                    
                    onLoadStart={() => console.log('WebView load started')}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error: ', nativeEvent);
                    }}
                    onHttpError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView HTTP error: ', nativeEvent);
                    }}
                />
            ) : null}
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
