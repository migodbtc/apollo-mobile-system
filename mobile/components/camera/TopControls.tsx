import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { TopControlProps } from "@/constants/interfaces/components";

const { width, height } = Dimensions.get("window");

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
};

const TopControls = ({
  isRecording,
  duration,
  isVideoMode,
  onToggleMode,
}: TopControlProps) => (
  <View style={styles.topRow}>
    <View
      style={[
        styles.modeButton,
        {
          width: width * 0.3,
          paddingHorizontal: width * 0.05,
          opacity: isRecording ? 1 : 0,
        },
      ]}
    >
      <Text style={styles.timerText}>
        {isRecording ? `${formatDuration(duration)}/30s` : "--/30s"}
      </Text>
    </View>
    <TouchableOpacity onPress={onToggleMode} style={styles.modeButton}>
      <FontAwesome
        name={isVideoMode ? "camera" : "video-camera"}
        size={width * 0.04}
        color="#f97316"
      />
      <Text style={styles.modeText}>MODE</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: height * 0.18,
    width: "100%",
    height: height * 0.05,
    paddingHorizontal: 4,
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
    fontSize: 16,
  },
  modeButton: {
    backgroundColor: "#020617",
    width: 72,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  modeText: {
    color: "#f97316",
    fontWeight: "600",
    fontSize: 12,
  },
});

export default TopControls;
