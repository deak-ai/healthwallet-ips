import React, { useState, useCallback } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, Dimensions, Platform } from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';

type BarcodeOverlayProps = {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  onPress?: () => void;
  isOpenId4Vp: boolean;
};

const CORNER_SIZE = 32;
const CORNER_BORDER_WIDTH = 3;
const CORNER_RADIUS = 20;
const YELLOW = '#FFD700';

const BarcodeOverlay: React.FC<BarcodeOverlayProps> = ({ bounds, onPress, isOpenId4Vp }) => {
  const Wrapper = isOpenId4Vp ? TouchableOpacity : View;
  const window = Dimensions.get('window');

  // Handle Android's coordinate system differences
  const adjustedBounds = Platform.OS === 'android' ? {
    origin: {
      x: window.width - bounds.origin.y - bounds.size.width,
      y: bounds.origin.x
    },
    size: {
      width: bounds.size.width,
      height: bounds.size.width
    }
  } : bounds;

  return (
    <Wrapper
      style={[
        styles.barcodeOverlay,
        {
          position: 'absolute',
          left: adjustedBounds.origin.x,
          top: adjustedBounds.origin.y,
          width: adjustedBounds.size.width,
          height: adjustedBounds.size.height,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Left Corner */}
      <View style={[styles.corner, styles.cornerTopLeft]}>
        <View style={[styles.cornerBorder, styles.cornerBorderTop, { borderColor: YELLOW }]} />
        <View style={[styles.cornerBorder, styles.cornerBorderLeft, { borderColor: YELLOW }]} />
      </View>
      
      {/* Top Right Corner */}
      <View style={[styles.corner, styles.cornerTopRight]}>
        <View style={[styles.cornerBorder, styles.cornerBorderTop, { borderColor: YELLOW }]} />
        <View style={[styles.cornerBorder, styles.cornerBorderRight, { borderColor: YELLOW }]} />
      </View>
      
      {/* Bottom Left Corner */}
      <View style={[styles.corner, styles.cornerBottomLeft]}>
        <View style={[styles.cornerBorder, styles.cornerBorderBottom, { borderColor: YELLOW }]} />
        <View style={[styles.cornerBorder, styles.cornerBorderLeft, { borderColor: YELLOW }]} />
      </View>
      
      {/* Bottom Right Corner */}
      <View style={[styles.corner, styles.cornerBottomRight]}>
        <View style={[styles.cornerBorder, styles.cornerBorderBottom, { borderColor: YELLOW }]} />
        <View style={[styles.cornerBorder, styles.cornerBorderRight, { borderColor: YELLOW }]} />
      </View>

      {isOpenId4Vp && (
        <View style={styles.selectButton}>
          <Text style={styles.selectButtonText}>Select</Text>
        </View>
      )}
    </Wrapper>
  );
};

export default function Scanner() {
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<BarcodeScanningResult | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  const isValidOpenId4VpUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'openid4vp:';
    } catch {
      return false;
    }
  };

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (result?.type === 'qr') {
      setLastScannedBarcode(result);
    } else {
      setLastScannedBarcode(null);
    }
  }, []);

  const handleBarcodePress = useCallback(() => {
    if (lastScannedBarcode && isValidOpenId4VpUrl(lastScannedBarcode.data)) {
      setIsProcessingBarcode(true);
      
      // Navigate to IPS screen with openId4vp URL
      router.push({
        pathname: "/(tabs)/ips",
        params: {
          openId4VpUrl: lastScannedBarcode.data,
          mode: 'openid4vp'
        }
      });
      
      setIsProcessingBarcode(false);
    }
  }, [lastScannedBarcode, router]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={isProcessingBarcode ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      {lastScannedBarcode?.bounds && !isProcessingBarcode && (
        <BarcodeOverlay 
          bounds={lastScannedBarcode.bounds} 
          onPress={handleBarcodePress}
          isOpenId4Vp={isValidOpenId4VpUrl(lastScannedBarcode.data)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  barcodeOverlay: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerBorder: {
    position: 'absolute',
    backgroundColor: YELLOW,
    borderRadius: CORNER_RADIUS,
  },
  cornerBorderTop: {
    top: 0,
    left: 0,
    right: 0,
    height: CORNER_BORDER_WIDTH,
  },
  cornerBorderBottom: {
    bottom: 0,
    left: 0,
    right: 0,
    height: CORNER_BORDER_WIDTH,
  },
  cornerBorderLeft: {
    left: 0,
    top: 0,
    bottom: 0,
    width: CORNER_BORDER_WIDTH,
  },
  cornerBorderRight: {
    right: 0,
    top: 0,
    bottom: 0,
    width: CORNER_BORDER_WIDTH,
  },
  cornerTopLeft: {
    top: -CORNER_SIZE / 2,
    left: -CORNER_SIZE / 2,
  },
  cornerTopRight: {
    top: -CORNER_SIZE / 2,
    right: -CORNER_SIZE / 2,
  },
  cornerBottomLeft: {
    bottom: -CORNER_SIZE / 2,
    left: -CORNER_SIZE / 2,
  },
  cornerBottomRight: {
    bottom: -CORNER_SIZE / 2,
    right: -CORNER_SIZE / 2,
  },
  selectButton: {
    position: 'absolute',
    bottom: -40,
    left: 0,
    right: 0,
    backgroundColor: YELLOW,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
