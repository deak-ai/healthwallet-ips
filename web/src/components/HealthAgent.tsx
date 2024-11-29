import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useConversation } from '@11labs/react';

const AGENT_ID = 'X8gItKgZWiF9FZh5CGax';

declare global {
  interface Window {
    healthAgentData?: {
      prompt: string;
      firstMessage: string;
    };
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    activeStream?: MediaStream;
  }
}

interface HealthAgentProps {
}

const HealthAgent: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [agentData, setAgentData] = useState<{ prompt: string; firstMessage: string } | null>(null);

  useEffect(() => {
    // Get initial data if available
    if (window.healthAgentData) {
      console.log('Initial agent data:', window.healthAgentData);
      setAgentData(window.healthAgentData);
    }
  }, []);

  const conversation = useConversation({
    onConnect: () => console.log('Connected to agent'),
    onDisconnect: () => console.log('Disconnected from agent'),
    onMessage: (message) => console.log('Received message:', message),
    onError: (error) => console.error('Conversation error:', error)
  });

  const { status, isSpeaking } = conversation;

  // Check microphone permissions when component mounts
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        // Check if we're in a WebView
        if (window.ReactNativeWebView) {
          console.log('Running in WebView, assuming permissions are already granted');
          // Send message to native app to check permission
          // window.ReactNativeWebView.postMessage(JSON.stringify({
          //   type: 'CHECK_MICROPHONE_PERMISSION'
          // }));

          // // Listen for response
          // const handleMessage = (event: MessageEvent) => {
          //   try {
          //     const data = JSON.parse(event.data);
          //     if (data.type === 'MICROPHONE_PERMISSION_STATUS') {
          //       console.log('Received permission status from native:', data.granted);
          //       setHasPermission(data.granted);
          //     }
          //   } catch (e) {
          //     console.error('Error parsing message:', e);
          //   }
          // };

          // window.addEventListener('message', handleMessage);

          setHasPermission(false);

          //return () => window.removeEventListener('message', handleMessage);
        } else {
          console.log('Running in browser, checking permissions directly');
          // Browser flow - use existing permission check
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioDevice = devices.find(device => device.kind === 'audioinput');
          if (audioDevice) {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setHasPermission(permissionStatus.state === 'granted');

            // Listen for permission changes
            permissionStatus.addEventListener('change', () => {
              setHasPermission(permissionStatus.state === 'granted');
            });
          } else {
            setHasPermission(false);
          }
        }
      } catch (error) {
        console.error('Error checking microphone permission:', error);
        setHasPermission(false);
      }
    };

    checkMicrophonePermission();
  }, []);

  const startConversation = async () => {
    console.log('Starting a new conversation');
    try {
      if (!hasPermission) {
        try {
          // Check if running on Android by checking user agent
          const isAndroid = /android/i.test(navigator.userAgent);
          console.log('Running on Android:', isAndroid);

          // Ensure mediaDevices is available
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('MediaDevices API not available');
          }

          // Platform-specific constraints
          const constraints = {
            audio: isAndroid ? true : {
              // Full constraints for iOS and other platforms
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          };

          console.log('Requesting media with constraints:', constraints);
          
          // Add a small delay before requesting media (helps on some Android devices)
          if (isAndroid) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Increased delay for Android
          }
          
          try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Got media stream:', stream.getAudioTracks().length > 0 ? 'Audio track available' : 'No audio track');
            
            // Keep the stream active
            window.activeStream = stream;
            setHasPermission(true);
          } catch (error) {
            console.error('Error getting user media:', error);
            // Try one more time with even simpler constraints on Android
            if (isAndroid) {
              try {
                console.log('Retrying with minimal constraints');
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: {} });
                console.log('Got fallback stream:', fallbackStream.getAudioTracks().length > 0 ? 'Audio track available' : 'No audio track');
                window.activeStream = fallbackStream;
                setHasPermission(true);
              } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw error; // Throw the original error if fallback also fails
              }
            } else {
              throw error;
            }
          }
        } catch (error) {
          console.error('Error getting user media:', error);
          // Log more details about the error
          if (error instanceof DOMException) {
            console.error('DOMException name:', error.name);
            console.error('DOMException message:', error.message);
          }
          setHasPermission(false);
          return; // Exit if we can't get the media stream
        }
      }

      console.log("Starting conversation with agent data:", agentData);

      try {
        const conversationId = await conversation.startSession({
          agentId: AGENT_ID,
          overrides: {
            agent: {
              prompt: {
                prompt: `You are Dr. Laura, a compassionate healthcare AI assistant. 
                Your mission is to answer any question related to the patients health record.
                You will only answer to questions about allergies and intolerances, medications and problems.
                If the healh data below says "NO HEALTH DATA FOUND", then ask the user to load their data.
                Stay truthful to the health data provided, do not make up information. Do not invent anything.
                
                Here is the health data:
                ${agentData?.prompt || ""}`
              },
              firstMessage: `${agentData?.firstMessage || ""} I can help you understand any details about your health record. What would you like to know?`,
              language: "en"
            }
          }
        });
        console.log('Started conversation:', conversationId);
      } catch (error) {
        console.error('Caught error while starting conversation:', error);
        // If conversation fails to start, clean up the media stream
        if (window.activeStream) {
          window.activeStream.getTracks().forEach(track => track.stop());
          delete window.activeStream;
        }
        throw error; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setHasPermission(false);
      }
    }
  };

  const stopConversation = async () => {
    try {
      await conversation.endSession();
      // Clean up media stream when conversation ends
      if (window.activeStream) {
        window.activeStream.getTracks().forEach(track => track.stop());
        delete window.activeStream;
      }
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  const getButtonText = () => {
    if (hasPermission === null) return 'Loading...';
    if (!hasPermission) return 'Allow Microphone';
    if (status === 'connecting') return 'Connecting...';
    if (status === 'connected') return 'Stop';
    return 'Start Conversation';
  };

  return (
    <div className="health-agent-container">
      <div className="voice-visualization-container">
        <div className="visualization-spotlight" />
        <motion.div
          className="voice-visualization"
          animate={{
            scale: status === 'connected' ? [1, 1.1, 1] : 1,
            opacity: isSpeaking ? [0.5, 1, 0.5] : 0.5
          }}
          transition={{
            duration: 2,
            repeat: status === 'connected' ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          <motion.button
            className="agent-button"
            onClick={status === 'connected' ? stopConversation : startConversation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={status === 'connecting' || hasPermission === null}
          >
            {getButtonText()}
          </motion.button>
        </motion.div>
      </div>

      <style>{`
        .health-agent-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 1rem;
          box-sizing: border-box;
        }

        .voice-visualization-container {
          position: relative;
          width: min(300px, 90vw);
          height: min(300px, 90vw);
          margin: auto;
        }

        .visualization-spotlight {
          position: absolute;
          top: 50%;
          left: 50%;
          width: min(400px, 120vw);
          height: min(400px, 120vw);
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle at center,
            rgba(59, 130, 246, 0.2) 0%,
            rgba(59, 130, 246, 0.1) 25%,
            rgba(59, 130, 246, 0.05) 50%,
            transparent 70%
          );
          animation: rotate 10s linear infinite;
          pointer-events: none;
        }

        @keyframes rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        .voice-visualization {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          z-index: 1;
          background: rgba(59, 130, 246, 0.1);
          backdrop-filter: blur(8px);
          box-shadow: 
            0 0 50px rgba(59, 130, 246, 0.2),
            inset 0 0 30px rgba(59, 130, 246, 0.1);
        }

        .agent-button {
          padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
          font-size: clamp(1rem, 3vw, 1.25rem);
          border: none;
          border-radius: 9999px;
          background: rgb(59, 130, 246);
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          white-space: nowrap;
        }

        .agent-button:disabled {
          opacity: 0.7;
          cursor: wait;
        }
      `}</style>
    </div>
  );
};

export default HealthAgent;
