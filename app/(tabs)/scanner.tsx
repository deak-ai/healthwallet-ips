import React, { useState } from "react";
import { Text, View, StyleSheet, Button, TouchableOpacity, Dimensions } from "react-native";
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult } from 'expo-camera';

type BarcodeOverlayProps = {
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  onPress: () => void;
};

const CORNER_SIZE = 32;
const CORNER_BORDER_WIDTH = 3;
const CORNER_RADIUS = 20;
const YELLOW = '#FFD700';

const BarcodeOverlay: React.FC<BarcodeOverlayProps> = ({ bounds, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.barcodeOverlay,
        {
          left: bounds.origin.x,
          top: bounds.origin.y,
          width: bounds.size.width,
          height: bounds.size.height,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Top Left Corner */}
      <View style={[styles.corner, styles.cornerTopLeft]}>
        <View style={[styles.cornerBorder, styles.cornerBorderTop]} />
        <View style={[styles.cornerBorder, styles.cornerBorderLeft]} />
      </View>
      
      {/* Top Right Corner */}
      <View style={[styles.corner, styles.cornerTopRight]}>
        <View style={[styles.cornerBorder, styles.cornerBorderTop]} />
        <View style={[styles.cornerBorder, styles.cornerBorderRight]} />
      </View>
      
      {/* Bottom Left Corner */}
      <View style={[styles.corner, styles.cornerBottomLeft]}>
        <View style={[styles.cornerBorder, styles.cornerBorderBottom]} />
        <View style={[styles.cornerBorder, styles.cornerBorderLeft]} />
      </View>
      
      {/* Bottom Right Corner */}
      <View style={[styles.corner, styles.cornerBottomRight]}>
        <View style={[styles.cornerBorder, styles.cornerBorderBottom]} />
        <View style={[styles.cornerBorder, styles.cornerBorderRight]} />
      </View>
    </TouchableOpacity>
  );
};

export default function Scanner() {
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<BarcodeScanningResult | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

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

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    setLastScannedBarcode(result);
  };

  const handleBarcodePress = () => {
    if (lastScannedBarcode) {
      setIsProcessingBarcode(true);
      alert(`Barcode content: ${lastScannedBarcode.data}`);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={isProcessingBarcode ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
      />
      {lastScannedBarcode?.bounds && !isProcessingBarcode && (
        <BarcodeOverlay
          bounds={lastScannedBarcode.bounds}
          onPress={handleBarcodePress}
        />
      )}
      {isProcessingBarcode && (
        <View style={styles.buttonContainer}>
          <Button
            title="Scan Again"
            onPress={() => {
              setIsProcessingBarcode(false);
              setLastScannedBarcode(null);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
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
});
