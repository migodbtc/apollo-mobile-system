import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { CombinedReport, PreverifiedReport } from "@/constants/types/database";
import { FontAwesome } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";
import type { ReportStatus } from "@/constants/interfaces/database";
import { handleSave } from "@/components/dash/ReportCard";

const { width, height } = Dimensions.get("window");

const severityOptions: {
  label: string;
  value: "mild" | "moderate" | "severe"  ;
}[] = [
  { label: "Mild", value: "mild" },
  { label: "Moderate", value: "moderate" },
  { label: "Severe", value: "severe" },
];

const spreadpotentialOptions: {
  label: string;
  value: "low" | "moderate" | "high"  ;
}[] = [
  { label: "Low", value: "low" },
  { label: "Moderate", value: "moderate" },
  { label: "High", value: "high" },
];

const firetypeOptions: {
  label: string;
  value: "small" | "medium" | "large"  ;
}[] = [
  { label: "Small", value: "small" },
  { label: "Medium", value: "medium" },
  { label: "Large", value: "large" },
];

const statusOptions: { label: string; value: ReportStatus }[] = [
  { label: "Pending", value: "pending" },
  { label: "Validated", value: "verified" },
  { label: "False Alarm", value: "false_alarm" },
  { label: "Resolved", value: "resolved" },
];


interface EditPostReportModalProps {
  visible: boolean;
  reportData: CombinedReport | null;
  onClose: () => void;
  onSave: (updatedData: PreverifiedReport) => void;
}

export const EditPostReportModal: React.FC<EditPostReportModalProps> = ({
  visible,
  reportData,
  onClose,
  onSave,
}) => {
  const { fetchPreverifiedReports } = useAdminSQL();

  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>("pending");
  const [statusDropdownVisible, setStatusDropdownVisible] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState<number>(50);
  const [selectedSeverity, setSelectedSeverity] = useState<"mild" | "moderate" | "severe" | null>(null);
  const [spreadPotential, setSpreadPotential] = useState<"low" | "moderate" | "high" > ("low");
  const [fireType, setFireType] = useState<"small" | "medium" | "large"> ("small");

   const refreshReports = useCallback(() => {
    fetchPreverifiedReports();
  }, []);

  useEffect(() => {
    if (reportData) {
      setSelectedStatus(
        (reportData[0]?.PR_report_status as ReportStatus) || "pending"
      );
    } else {
      setSelectedStatus("pending");
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
          <Text style={styles.modalTitle}>UPDATE STATUS</Text>

          {/* STATUS SELECT */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionLabel}>Status</Text>
            <TouchableOpacity
              onPress={() => setStatusDropdownVisible(!statusDropdownVisible)}
              style={styles.dropdownButton}
            >
              <Text style={{ color: "#F8FAFC" }}>
                {selectedStatus.charAt(0).toUpperCase() +
                  selectedStatus.slice(1)}
              </Text>
              <FontAwesome
                name={statusDropdownVisible ? "chevron-up" : "chevron-down"}
                size={16}
                color="#f97316"
              />
            </TouchableOpacity>

            {statusDropdownVisible && (
              <View style={styles.dropdownMenu}>
                {statusOptions
                .filter((option) => option.value !== "pending") 
                .map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setSelectedStatus(option.value);
                      setStatusDropdownVisible(false);
                    }}
                    style={{ paddingVertical: 8, paddingHorizontal: 12 }}
                  >
                    <Text style={{ color: "#F8FAFC" }}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* THE SLIDER OF CONFIDENCE */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionLabel}>Confidence Level</Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={confidenceLevel}
              onValueChange={(val) => setConfidenceLevel(val)}
              minimumTrackTintColor="#f97316"
              maximumTrackTintColor="#475569"
              thumbTintColor="#f97316"
            />
            <Text style={{ color: "#F8FAFC", textAlign: "center" }}>
              {confidenceLevel}%
            </Text>
          </View>

          
          {(selectedStatus === "verified" || selectedStatus === "resolved") && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionLabel}>Severity</Text>
              <View style={styles.radioRow}>
                {severityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButton}
                    onPress={() => setSelectedSeverity(option.value)}
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
            </View>
          )}

          {(selectedStatus === "verified" || selectedStatus === "resolved") && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionLabel}>Spread Potential</Text>
              <View style={styles.radioRow}>
                {spreadpotentialOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButton}
                    onPress={() => setSpreadPotential(option.value)}
                  >
                    <View style={styles.radioCircle}>
                      {spreadPotential === option.value && (
                        <View style={styles.selectedRb} />
                      )}
                    </View>
                    <Text style={styles.radioText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(selectedStatus === "verified" || selectedStatus === "resolved") && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionLabel}>Fire Type</Text>
              <View style={styles.radioRow}>
                {firetypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButton}
                    onPress={() => setFireType(option.value)}
                  >
                    <View style={styles.radioCircle}>
                      {fireType === option.value && (
                        <View style={styles.selectedRb} />
                      )}
                    </View>
                    <Text style={styles.radioText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={async () => {
              if (!reportData?.[0]) return;

              await handleSave({
                PR_report_id: reportData[0].PR_report_id,
                PR_report_status: selectedStatus,
                VR_confidence_score: confidenceLevel,
                VR_severity_level: selectedSeverity,
                VR_spread_potential: spreadPotential,
                VR_fire_type: fireType,
              });

              await refreshReports();

              // Close the modal after saving & refreshing
              onClose();
            }}
            style={styles.saveButton}
          >
            <Text style={styles.buttonText}>
              <FontAwesome name="save" size={20} color="white" /> SAVE
            </Text>
          </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.buttonText}>
                <FontAwesome name="times" size={20} color="white" /> CLOSE
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
    marginBottom: height * 0.015,
  },
  sectionLabel: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#f97316",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#f97316",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#1e293b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownMenu: {
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
  },
  radioRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
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
  saveButton: {
    backgroundColor: "#f97316",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: "#42475A",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.038,
  },
});

export default EditPostReportModal;
