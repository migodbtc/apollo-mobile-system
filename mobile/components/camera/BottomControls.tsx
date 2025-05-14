import React from "react";
import { View, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { BottomControlProps } from "@/constants/interfaces/components";

const { width, height } = Dimensions.get("window");

const BottomControls = ({
  isRecording,
  isVideoMode,
  onRecord,
  onFlipCamera,
  onBack,
  onCapturePhoto,
}: BottomControlProps) => (
  <View style={styles.container}>
    {!isRecording && (
      <TouchableOpacity onPress={onBack} style={styles.button}>
        <FontAwesome name="chevron-left" size={48} color="#f97316" />
      </TouchableOpacity>
    )}

    <TouchableOpacity
      onPress={isVideoMode ? onRecord : onCapturePhoto}
      style={styles.button}
    >
      <FontAwesome
        name={
          isVideoMode
            ? isRecording
              ? "stop-circle"
              : "video-camera"
            : "camera"
        }
        size={48}
        color={isVideoMode && isRecording ? "red" : "#f97316"}
      />
    </TouchableOpacity>

    {!isRecording && (
      <TouchableOpacity onPress={onFlipCamera} style={styles.button}>
        <FontAwesome name="exchange" size={48} color="#f97316" />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 120,
    backgroundColor: "#020617",
    zIndex: 2,
  },
  button: {
    marginHorizontal: 10,
    width: 64,
    height: 64,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderRadius: 25,
  },
});

export default BottomControls;
