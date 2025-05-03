import React, { useEffect, useState } from "react";
import { Text, View, Dimensions, StyleSheet } from "react-native";
import { Camera, CameraView } from "expo-camera";
import { Audio, Video } from "expo-av";
import TopControls from "./TopControls";
import BottomControls from "./BottomControls";
import { CameraPanelProps } from "@/constants/interfaces/components";

const CameraPanel = ({
  cameraRef,
  videoRef,
  facing,
  setFacing,
  isRecording,
  isVideoMode,
  toggleMediaType,
  handleStartRecording,
  handleStopRecording,
  recordingDuration,
  handleGoBack,
}: CameraPanelProps) => {
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width * (16 / 9),
  });
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      const { width } = Dimensions.get("window");
      setDimensions({
        width,
        height: width * (16 / 9),
      });
    };

    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );
    updateDimensions();

    const requestPermissions = async () => {
      try {
        const { status: cameraStatus } =
          await Camera.requestCameraPermissionsAsync();
        const { status: micStatus } = await Audio.requestPermissionsAsync();

        setPermissionsGranted(
          cameraStatus === "granted" && micStatus === "granted"
        );

        // if (!permissionsGranted) {
        //   console.log("Camera permissions:", cameraStatus);
        //   console.log("Microphone permissions:", micStatus);
        // }
      } catch (error) {
        console.error("Permission error:", error);
      }
    };

    requestPermissions();

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isRecording && recordingDuration >= 31) {
      handleStopRecording();
    }
  }, [recordingDuration, isRecording]);

  return (
    <View style={styles.container}>
      {permissionsGranted ? (
        <View style={[styles.cameraContainer, dimensions]}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            mode="video"
            onCameraReady={() => {
              setTimeout(() => setCameraReady(true), 100);
            }}
          />
          {!cameraReady && <View style={styles.cameraPlaceholder} />}
        </View>
      ) : (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Waiting for camera permissions...
          </Text>
        </View>
      )}

      <TopControls
        isRecording={isRecording}
        duration={recordingDuration}
        isVideoMode={isVideoMode}
        onToggleMode={toggleMediaType}
      />

      <BottomControls
        isRecording={isRecording}
        isVideoMode={isVideoMode}
        onRecord={isRecording ? handleStopRecording : handleStartRecording}
        onFlipCamera={() => setFacing(facing === "back" ? "front" : "back")}
        onBack={handleGoBack}
      />

      <Video
        ref={videoRef}
        source={undefined}
        style={{ width: 0, height: 0 }}
        isMuted
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    overflow: "hidden",
    backgroundColor: "black",
    position: "relative",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: "white",
    fontSize: 16,
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
});

export default CameraPanel;
