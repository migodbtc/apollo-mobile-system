import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { ReportHelpModalProps } from "@/constants/interfaces/components";

const { width, height } = Dimensions.get("window");

const ReportHelpModal: React.FC<ReportHelpModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Help Information</Text>
          <Text style={styles.modalTextHelp}>
            This panel shows a list of submitted reports categorized as
            either...
            {"\n"}
            <Text style={{ color: "#f97316", fontWeight: "bold" }}>
              • Preverified
            </Text>{" "}
            — Initial reports awaiting validation.
            {"\n"}
            <Text style={{ color: "#f97316", fontWeight: "bold" }}>
              • Verified
            </Text>{" "}
            — Reports confirmed through system checks.
            {"\n\n"}
            Tap a card to view full details including...
            {"\n"}
            <FontAwesome name="check-circle" size={width * 0.035} />
            {"  "}Status
            {"\n"}
            <FontAwesome name="signal" size={width * 0.035} />
            {"  "}Confidence Score
            {"\n"}
            <FontAwesome name="exclamation-triangle" size={width * 0.035} />
            {"  "}Severity Level
            {"\n"}
            <FontAwesome name="fire" size={width * 0.035} />
            {"  "}Spread Potential
            {"\n"}
            <FontAwesome name="list-alt" size={width * 0.035} />
            {"  "}Fire Type
          </Text>

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: width * 0.05,
  },
  modalTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  modalTextHelp: {
    fontSize: width * 0.035,
    color: "#FFFFFF",
    textAlign: "left",
  },
  modalCloseButton: {
    marginTop: height * 0.03,
    backgroundColor: "#f97316",
    paddingVertical: height * 0.015,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: width * 0.04,
  },
});

export default ReportHelpModal;
