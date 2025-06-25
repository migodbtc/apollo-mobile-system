import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { CameraPanelProps } from "@/constants/interfaces/components";
import { FontAwesome } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
};

const CameraPanel = ({
  cameraRef,
  facing,
  setFacing,
  isRecording,
  isVideoMode,
  toggleMediaType,
  handleStartRecording,
  handleStopRecording,
  recordingDuration,
  handleGoBack,
  handleTakePhoto,
  captureFeedback,
}: CameraPanelProps) => {
  const [dimensions, setDimensions] = useState({
    width: width,
    height: width * (16 / 9),
  });
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);

  const handleFlipCamera = () => {
    setIsSwitchingCamera(true);
    setFacing(facing === "back" ? "front" : "back");
    setTimeout(() => setIsSwitchingCamera(false), 750);
  };

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
        setPermissionsGranted(cameraStatus === "granted");
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
    <>
      {/* Switching camera views overlay */}
      {isSwitchingCamera && (
        <View style={styles.switchingOverlay}>
          <View style={styles.switchBackground}>
            <Text style={styles.switchingText}>Swapping...</Text>
          </View>
        </View>
      )}

      {/* Capture feedback overlay */}
      {captureFeedback && (
        <View style={styles.switchingOverlay}>
          <View style={styles.switchBackground}>
            <Text style={styles.switchingText}>
              {captureFeedback === "photo"
                ? "Photo captured!"
                : "Video captured!"}
            </Text>
          </View>
        </View>
      )}

      {/* CameraView container */}
      <View style={styles.mainContainer}>
        {/* Permissions overlay */}
        {permissionsGranted ? (
          <View style={[styles.cameraContainer, dimensions]}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              mode={isVideoMode ? "video" : "picture"}
              onCameraReady={() => setTimeout(() => setCameraReady(true), 100)}
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

        {/* Sidebar (contains mode swap & timer text) */}
        <View style={styles.sideBar}>
          <TouchableOpacity
            onPress={toggleMediaType}
            style={[styles.modeButton, { opacity: isRecording ? 0 : 1 }]}
          >
            <FontAwesome
              name={isVideoMode ? "camera" : "video-camera"}
              size={width * 0.04}
              color="#f97316"
              style={styles.iconShadow}
            />
            <Text style={styles.modeText}>SWAP</Text>
          </TouchableOpacity>
          <View style={[styles.modeButton, { opacity: isRecording ? 1 : 0 }]}>
            <Text style={styles.timerText}>
              {isRecording
                ? `${formatDuration(recordingDuration)}/30s`
                : "--/30s"}
            </Text>
          </View>
        </View>

        {/* Top row (contains the recording button) */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={
              isVideoMode
                ? isRecording
                  ? handleStopRecording
                  : handleStartRecording
                : handleTakePhoto
            }
            style={[
              styles.button2,
              {
                width: width * 0.2,
                backgroundColor: "#f97316",
                borderRadius: width * 0.1,
              },
            ]}
          >
            <FontAwesome
              name={
                isVideoMode ? (isRecording ? "stop" : "video-camera") : "camera"
              }
              size={width * 0.1}
              color={isVideoMode && isRecording ? "red" : "#020617"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom row (contains exit button & camera swap button).  */}
      <View style={styles.container2}>
        {!isRecording && (
          <TouchableOpacity onPress={handleGoBack} style={styles.button2}>
            <FontAwesome
              name="sign-out"
              size={width * 0.1}
              color="#42475A"
              style={styles.iconShadow}
            />
          </TouchableOpacity>
        )}

        {!isRecording && (
          <TouchableOpacity onPress={handleFlipCamera} style={styles.button2}>
            <FontAwesome
              name="refresh"
              size={width * 0.1}
              color="#6c757d"
              style={styles.iconShadow}
            />
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    aspectRatio: 9 / 16,
    backgroundColor: "#18181b",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.03,
    alignSelf: "center",
    overflow: "hidden",
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
    color: "f97316",
    fontSize: width * 0.025,
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 4,
    paddingBottom: height * 0.01,
    zIndex: 2,
  },
  timer: {
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  timerText: {
    color: "#f97316",
    fontWeight: "600",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  modeButton: {
    width: width * 0.2,
    aspectRatio: 3 / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  modeText: {
    color: "#f97316",
    fontWeight: "600",
    fontSize: 12,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  iconShadow: {
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  container2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    paddingHorizontal: width * 0.02,
    bottom: 0,
    width: "100%",
    height: "auto",
    zIndex: 2,
  },
  button2: {
    marginHorizontal: 10,
    width: width * 0.16,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderRadius: width * 0.08,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  sideBar: {
    position: "absolute",
    left: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    width: "auto",
    height: "50%",
  },
  switchingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  switchBackground: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderRadius: width * 0.04,
    alignItems: "center",
    justifyContent: "center",
  },
  switchingText: {
    color: "#FFFFFF",
    fontSize: width * 0.035,
    fontWeight: "bold",
  },
});

export default CameraPanel;
