import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";

import { CameraView, CameraType, useCameraPermissions } from "expo-camera";

import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";

type Props = {};

const Camera = (props: Props) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const cameraRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const isFocused = useIsFocused();
  const [qrData, setQRData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   if (isFocused) {
  //     // Reset scanning each time user comes back to this tab/screen
  //     setIsScanning(true);
  //   }
  // }, [isFocused]);
  
  if (!permission) {
    // Camera permissions are still loading.
    return <SafeAreaView />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </SafeAreaView>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handlePauseCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.pausePreview();
    }
  };

  const handleResumeCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.resumePreview();
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (isScanning && data) {
      setQRData(data);
      setIsScanning(false);
      setTimeout(() => {
        Alert.alert(
          "QR code by slee6390",
          data,
          [
            {
              text: "Cancel",
              style: "cancel",
              // Reset scanning when "Cancel" pressed
              onPress: () => {
                setIsScanning(true);
              },
            },
            {
              text: "Proceed/Open",
              // Redirect page when "Proceed/Open" pressed
              onPress: () => {
                router.push("externalwebview?data=" + encodeURIComponent(data));
              },
            },
          ],
          { cancelable: false }
        );
      }, 100); // 100ms delay ensures alert renders properly
      console.log(`QR Code Scanned! Type: ${type}, Data: ${data}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {isFocused && showCamera && (
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"], // Specify to scan only QR codes
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handlePauseCamera}>
          <Text style={styles.text}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleResumeCamera}>
          <Text style={styles.text}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowCamera(!showCamera)}
        >
          <Text style={styles.text}>On/Off</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Camera;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    backgroundColor: "transparent",
    width: "100%",
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});