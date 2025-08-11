import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { PostverifiedReport } from "@/constants/interfaces/database";
import { CombinedReport, PreverifiedReport } from "@/constants/types/database";
import { FontAwesome } from "@expo/vector-icons";
import Slider, { SliderProps } from '@react-native-community/slider';
import { useCallback } from "react";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";



const { width, height } = Dimensions.get("window");


const severityOptions: {
  label: string;
  value: "low" | "moderate" | "high" | "critical";
}[] = [
  { label: "Low", value: "low" },
  { label: "Moderate", value: "moderate" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

const statusOptions: { label: string; value: "validated" | "false_alarm" | "resolved" }[] = [
  { label: "Validated", value: "validated" },
  { label: "False Alarm", value: "false_alarm" },
  { label: "Resolved", value: "resolved" },
];

interface EditPostReportModalProps {
  visible: boolean;
  reportData: CombinedReport | null;
  onClose: () => void;
  onSave: (updatedData: Partial<PostverifiedReport>) => void;
  
}

export const EditPostReportModal: React.FC<EditPostReportModalProps> = ({
  visible,
  reportData,
  onClose,
  onSave,
}) => {
  const { fetchPreverifiedReports, fetchPostverifiedReports } = useAdminSQL();
  const [selectedSeverity, setSelectedSeverity] = useState<
    "low" | "moderate" | "high" | "critical"
  >("low");

  const [selectedStatus, setSelectedStatus] = useState<
    "validated" | "false_alarm" | "resolved"
  >("validated");

  const [confidenceLevel, setConfidenceLevel] = useState<number>(0.5);

  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);

  const refreshReports = useCallback(() => {
    fetchPreverifiedReports();
    fetchPostverifiedReports();
  }, []);


  useEffect(() => {
    if (reportData) {
      // Initialize all states from reportData
      setSelectedSeverity(reportData[1]?.VR_severity_level || "low");
      setSelectedStatus(reportData[0]?.PR_report_status as "validated" | "false_alarm" | "resolved" || "validated");
      setConfidenceLevel(reportData[1]?.VR_confidence_score || 0.5);
    } else {
      // Reset to defaults if no reportData
      setSelectedSeverity("low");
      setSelectedStatus("validated");
      setConfidenceLevel(0.5);
    }
  }, [reportData]);
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>VALIDATION DETAILS</Text>
          <Text style={{ color: "white", marginBottom: height * 0.01 }}>
            Update the severity level and status of this verified report.
          </Text>

          {/* STATUS ROW */}
          <View style={{ marginBottom: height * 0.015, position: "relative" }}>
            <Text style={[styles.sectionLabel, { marginTop: 0 }]}>Status</Text>
            <TouchableOpacity
              onPress={() => setStatusDropdownVisible(!statusDropdownVisible)}
              style={{
                borderWidth: 1,
                borderColor: "#f97316",
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
                backgroundColor: "#1e293b",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: "#F8FAFC", fontSize: width * 0.037 }}>
                {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
              </Text>
              <FontAwesome
                name={statusDropdownVisible ? "chevron-up" : "chevron-down"}
                size={width * 0.035}
                color="#f97316"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>

            {statusDropdownVisible && (
              <View
                style={{
                  position: "absolute",
                  top: "100%", 
                  left: 0,
                  right: 0,
                  backgroundColor: "#1e293b",
                  borderWidth: 1,
                  borderColor: "#f97316",
                  borderRadius: 8,
                  marginTop: 4,
                  zIndex: 10,
                }}
              >
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setSelectedStatus(option.value);
                      setStatusDropdownVisible(false);
                    }}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text style={{ color: "#F8FAFC", fontSize: width * 0.037 }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <View style={{ marginTop: height * 0.02 }}>
              <Text style={styles.sectionLabel}>Confidence Level</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Slider
                  style={{ flex: 1 }}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.01}
                  minimumTrackTintColor="#f97316"
                  maximumTrackTintColor="#94a3b8"
                  thumbTintColor="#f97316"
                  value={confidenceLevel}
                  onValueChange={(value: number) => setConfidenceLevel(value)}
                />
                <Text style={{ color: "#F8FAFC", marginLeft: width * 0.02 }}>
                  {(confidenceLevel * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>

          {/* SEVERITY OPTIONS */}
          <Text style={styles.sectionLabel}>Severity</Text>
          {(selectedStatus === "validated" || selectedStatus === "resolved") && (
            <View style={styles.radioRow}>
              {severityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioButton}
                  onPress={() => setSelectedSeverity(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {selectedSeverity === option.value && (
                      <View style={styles.selectedRb} />
                    )}
                  </View>
                  <Text style={styles.radioText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

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
              Confirm the changes and update the postverified report.
            </Text>
          </View>

          {/* BUTTONS */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: width * 0.02,
              marginTop: height * 0.02,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                onSave({
                  VR_report_id: reportData?.VR_report_id,
                  VR_severity_level: selectedSeverity,
                  VR_status: selectedStatus, 
                  VR_confidence_score: confidenceLevel, 

                });refreshReports()}
              }
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
                <FontAwesome name="save" size={20} color="white" />
                {"  "}SAVE
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedSeverity(reportData?.VR_severity_level || "low");
                setSelectedStatus("validated");
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
                <FontAwesome name="refresh" size={20} color="white" />
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
                <FontAwesome name="times" size={20} color="white" />
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
  label: {
    fontSize: width * 0.04,
    color: '#f97316',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.038,
  },
});

export default EditPostReportModal;