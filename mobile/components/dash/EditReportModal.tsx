import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
} from "react-native";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import { FontAwesome } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Validated", value: "verified" },
  { label: "False Alarm", value: "false alarm" },
  { label: "Resolved", value: "resolved" },
];

interface EditReportModalProps {
  visible: boolean;
  reportData: [PreverifiedReport, PostverifiedReport | null] | null;
  onClose: () => void;
  onSave: (updatedData: { status: string }) => void;
}

export const EditReportModal: React.FC<EditReportModalProps> = ({
  visible,
  reportData,
  onClose,
  onSave,
}) => {
  const [selectedStatus, setSelectedStatus] = useState("pending");

  useEffect(() => {
    setSelectedStatus(
      reportData?.[0]?.PR_report_status?.toLowerCase() || "pending"
    );
  }, [visible, reportData]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Report Status</Text>
          <Text style={{ color: "white", marginBottom: height * 0.01 }}>
            Update the status of the report manually here.
          </Text>

          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.radioRow}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioButton}
                onPress={() => setSelectedStatus(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.radioCircle}>
                  {selectedStatus === option.value && (
                    <View style={styles.selectedRb} />
                  )}
                </View>
                <Text style={styles.radioText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={{
              fontSize: width * 0.032,
              color: "#94a3b8",
              letterSpacing: 0.8,
            }}
          >
            ADDITIONAL DETAILS
          </Text>
          <View style={{ marginBottom: height * 0.02 }}>
            <Text style={{ color: "white" }}>
              To complete the validation, please enter the following details in
              order to submit to the system.
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: width * 0.02,
              marginTop: height * 0.02,
            }}
          >
            <TouchableOpacity
              onPress={() => onSave({ status: selectedStatus })}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f97316",
                paddingVertical: height * 0.006,
                paddingHorizontal: width * 0.03,
                borderRadius: 10,
              }}
            >
              <Text style={styles.buttonText}>
                <FontAwesome name="save" size={20} color="#white" />
                {"  "}
                SAVE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setSelectedStatus(
                  reportData?.[0]?.PR_report_status?.toLowerCase() || "pending"
                );
              }}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#6c757d",
                paddingVertical: height * 0.006,
                paddingHorizontal: width * 0.03,
                borderRadius: 10,
              }}
            >
              <Text style={styles.buttonText}>
                <FontAwesome name="refresh" size={20} color="#white" />
                {"  "}RESET
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#42475A",
                paddingVertical: height * 0.006,
                paddingHorizontal: width * 0.03,
                borderRadius: 10,
              }}
            >
              <Text style={styles.buttonText}>
                <FontAwesome name="times" size={20} color="#white" />
                {"  "}CLOSE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: width * 0.06,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#f97316",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: height * 0.01,
  },
  sectionLabel: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#f97316",
    marginTop: height * 0.01,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: height * 0.015,
    justifyContent: "space-between",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 18,
    marginBottom: 8,
    minWidth: width * 0.32,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
  },
  radioText: {
    color: "#E2E8F0",
    fontSize: width * 0.037,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#334155",
    color: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: width * 0.037,
    marginBottom: height * 0.02,
    marginTop: 2,
    minHeight: 48,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: height * 0.01,
    marginBottom: height * 0.01,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.038,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: width * 0.042,
    letterSpacing: 0.5,
  },
});

export default EditReportModal;
