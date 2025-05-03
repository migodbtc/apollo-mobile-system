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
}: BottomControlProps) => (
  <View style={styles.container}>
    {!isRecording && (
      <TouchableOpacity onPress={onBack} style={styles.button}>
        <FontAwesome name="chevron-left" size={width * 0.1} color="#f97316" />
      </TouchableOpacity>
    )}

    <TouchableOpacity onPress={onRecord} style={styles.button}>
      <FontAwesome
        name={
          isVideoMode ? "camera" : isRecording ? "stop-circle" : "video-camera"
        }
        size={width * 0.1}
        color={isRecording ? "red" : "#f97316"}
      />
    </TouchableOpacity>

    {!isRecording && (
      <TouchableOpacity onPress={onFlipCamera} style={styles.button}>
        <FontAwesome name="exchange" size={width * 0.1} color="#f97316" />
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
    height: height * 0.15,
    paddingBottom: height * 0.03,
    backgroundColor: "#020617",
    zIndex: 2,
  },
  button: {
    marginHorizontal: 10,
    width: 72,
    height: 52,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
    borderRadius: 25,
  },
});

export default BottomControls;
