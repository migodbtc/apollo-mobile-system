import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import { FontAwesome } from "@expo/vector-icons";
import SERVER_LINK from "@/constants/netvar";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";

const { width, height } = Dimensions.get("window");

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Validated", value: "verified" },
  { label: "False Alarm", value: "false_alarm" },
  { label: "Resolved", value: "resolved" },
];

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Mild" },
  { value: "moderate", label: "Moderate" },
  { value: "severe", label: "Severe" },
];

const SPREAD_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
];

const FIRE_TYPE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
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
}) => {
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [confidence, setConfidence] = useState(0);
  const [detected, setDetected] = useState(false);
  const [severity, setSeverity] = useState<string | undefined>(undefined);
  const [spread, setSpread] = useState<string | undefined>(undefined);
  const [fireType, setFireType] = useState<string | undefined>(undefined);
  // State to track if save is attempted with no changes
  const [noChangesAttempted, setNoChangesAttempted] = useState(false);
  const [missingFieldsAlert, setMissingFieldsAlert] = useState(false);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);
  const { fetchPreverifiedReports, fetchPostverifiedReports } = useAdminSQL();

  useEffect(() => {
    setSelectedStatus(
      reportData?.[0]?.PR_report_status?.toLowerCase() || "pending"
    );
    setConfidence(reportData?.[1]?.VR_confidence_score || 0);
    setDetected(reportData?.[1]?.VR_detected ?? false);
    setSeverity(reportData?.[1]?.VR_severity_level);
    setSpread(reportData?.[1]?.VR_spread_potential);
    setFireType(reportData?.[1]?.VR_fire_type);
  }, [visible, reportData]);

  // Placeholder handler functions for requests

  const isUnchanged = () => {
    // log comparisons first before calculating for result
    console.log("isUnchanged() called");
    console.log(reportData);
    if (!reportData) return true;
    const [pre, post] = reportData;
    const statusUnchanged =
      (pre?.PR_report_status?.toLowerCase() || "pending") === selectedStatus;
    const confidenceUnchanged =
      Number(post?.VR_confidence_score ?? 0) === Number(confidence);
    const detectedUnchanged =
      Boolean(post?.VR_detected ?? false) === Boolean(detected);
    const severityUnchanged =
      (post?.VR_severity_level?.toLowerCase() ?? "") ===
      (severity?.toLowerCase() ?? "");
    const spreadUnchanged =
      (post?.VR_spread_potential?.toLowerCase() ?? "") ===
      (spread?.toLowerCase() ?? "");
    const fireTypeUnchanged =
      (post?.VR_fire_type?.toLowerCase() ?? "") ===
      (fireType?.toLowerCase() ?? "");

    if (selectedStatus === "false_alarm") {
      return statusUnchanged && confidenceUnchanged && !detectedUnchanged;
    } else if (selectedStatus === "verified" || selectedStatus === "resolved") {
      return (
        statusUnchanged &&
        confidenceUnchanged &&
        detectedUnchanged &&
        severityUnchanged &&
        spreadUnchanged &&
        fireTypeUnchanged
      );
    } else {
      return statusUnchanged;
    }
  };

  const generateVisualBadge = (level: string | undefined) => {
    if (level == undefined) {
      return (
        <View style={[styles.badge, styles.badgeMuted]}>
          <Text style={styles.badgeText}>None</Text>
        </View>
      );
    }

    const normalizedLevel = level.toLowerCase();

    if (["small", "mild", "low"].includes(normalizedLevel)) {
      return (
        <View style={[styles.badge, styles.badgeSecondary]}>
          <Text style={styles.badgeText}>
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </Text>
        </View>
      );
    }

    if (["moderate", "medium"].includes(normalizedLevel)) {
      return (
        <View style={[styles.badge, styles.badgeWarning]}>
          <Text style={styles.badgeText}>
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </Text>
        </View>
      );
    }

    if (["large", "severe", "high"].includes(normalizedLevel)) {
      return (
        <View style={[styles.badge, styles.badgeDanger]}>
          <Text style={styles.badgeText}>
            {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
          </Text>
        </View>
      );
    }

    // fallback
    return (
      <View style={[styles.badge, styles.badgeMuted]}>
        <Text style={styles.badgeText}>Unknown</Text>
      </View>
    );
  };

  const handleSave = async () => {
    // Only show missing fields alert if status is verified/resolved and any field is missing
    if (
      (selectedStatus === "verified" || selectedStatus === "resolved") &&
      (!severity || !spread || !fireType)
    ) {
      setMissingFieldsAlert(true);
      return;
    }
    setMissingFieldsAlert(false);

    if (isUnchanged()) {
      setNoChangesAttempted(true);
      return;
    }
    setNoChangesAttempted(false);

    const update_verify_preverified_endpoint = `${SERVER_LINK}/reports/preverified/one/verify`;

    let verify_payload;
    if (selectedStatus === "false_alarm") {
      verify_payload = [
        {
          PR_user_id: reportData?.[0]?.PR_user_id,
          PR_image: reportData?.[0]?.PR_image,
          PR_video: reportData?.[0]?.PR_video,
          PR_report_id: reportData?.[0]?.PR_report_id,
          PR_report_status: selectedStatus,
          PR_verified: 1,
          PR_latitude: reportData?.[0]?.PR_latitude,
          PR_longitude: reportData?.[0]?.PR_longitude,
          PR_address: reportData?.[0]?.PR_address,
          PR_timestamp: reportData?.[0]?.PR_timestamp,
        },
        {
          VR_verification_id: 999, // dummy, not used in backend
          VR_report_id: reportData?.[0]?.PR_report_id,
          VR_confidence_score: confidence,
          VR_detected: detected ? 1 : 0,
          VR_verification_timestamp: new Date().toISOString(),
        },
      ];
    } else {
      verify_payload = [
        {
          PR_user_id: reportData?.[0]?.PR_user_id,
          PR_image: reportData?.[0]?.PR_image,
          PR_video: reportData?.[0]?.PR_video,
          PR_report_id: reportData?.[0]?.PR_report_id,
          PR_report_status: selectedStatus,
          PR_verified: selectedStatus === "pending" ? 0 : 1,
          PR_latitude: reportData?.[0]?.PR_latitude,
          PR_longitude: reportData?.[0]?.PR_longitude,
          PR_address: reportData?.[0]?.PR_address,
          PR_timestamp: reportData?.[0]?.PR_timestamp,
        },
        {
          VR_verification_id: 999,
          VR_report_id: reportData?.[0]?.PR_report_id,
          VR_confidence_score: confidence,
          VR_detected: detected ? 1 : 0,
          VR_severity_level: severity,
          VR_spread_potential: spread,
          VR_fire_type: fireType,
          VR_verification_timestamp: new Date().toISOString(),
        },
      ];
    }

    try {
      const verificationResponse = await fetch(
        update_verify_preverified_endpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verify_payload),
        }
      );

      const verificationData = await verificationResponse.json();

      if (verificationResponse.ok) {
        setSuccessAlert("Report updated successfully!");
        setTimeout(() => {
          setSuccessAlert(null);
          onClose();
        }, 1200);
      } else {
        setSuccessAlert(
          verificationData?.error ||
            "Failed to update report. Please try again."
        );
        setTimeout(() => setSuccessAlert(null), 2000);
      }
      console.log("Verification Update Response:", verificationData);
    } catch (e) {
      setSuccessAlert("Network error. Please try again.");
      setTimeout(() => setSuccessAlert(null), 2000);
      console.error(e);
    } finally {
      console.log("Finishing up...");
      fetchPreverifiedReports().then(() => fetchPostverifiedReports());
    }
  };

  const handleReset = () => {
    setSelectedStatus(
      reportData?.[0]?.PR_report_status?.toLowerCase() || "pending"
    );
    setConfidence(reportData?.[1]?.VR_confidence_score || 0);
    setDetected(reportData?.[1]?.VR_detected ?? false);
    setSeverity(reportData?.[1]?.VR_severity_level);
    setSpread(reportData?.[1]?.VR_spread_potential);
    setFireType(reportData?.[1]?.VR_fire_type);
    setNoChangesAttempted(false);
    setMissingFieldsAlert(false);
  };

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
                onPress={() => {
                  setSelectedStatus(option.value);
                  setNoChangesAttempted(false);
                }}
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

          {/* Conditional UI for status */}
          {(selectedStatus === "false_alarm" ||
            selectedStatus === "verified" ||
            selectedStatus === "resolved") && (
            <>
              <Text style={styles.sectionLabel}>Confidence Score</Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: 16,
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    width: "20%",
                    color: "white",
                    fontSize: width * 0.04,
                    marginBottom: 2,
                  }}
                >
                  {confidence}%
                </Text>
                <Slider
                  style={{ width: "80%", height: 40 }}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={confidence}
                  minimumTrackTintColor="#f97316"
                  maximumTrackTintColor="#334155"
                  thumbTintColor="#f97316"
                  onValueChange={setConfidence}
                />
              </View>
            </>
          )}

          {(selectedStatus === "verified" || selectedStatus === "resolved") && (
            <>
              <Text style={styles.sectionLabel}>Detected</Text>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setDetected(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {detected && <View style={styles.selectedRb} />}
                  </View>
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setDetected(false)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {!detected && <View style={styles.selectedRb} />}
                  </View>
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionLabel}>Severity Level</Text>
              <View style={[styles.optionRow]}>
                {SEVERITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButtonAlt}
                    onPress={() => setSeverity(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {severity === option.value && (
                        <View style={styles.selectedRb} />
                      )}
                    </View>
                    <Text style={styles.radioText}>
                      {generateVisualBadge(option.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionLabel}>Spread Potential</Text>
              <View style={styles.optionRow}>
                {SPREAD_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButtonAlt}
                    onPress={() => setSpread(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {spread === option.value && (
                        <View style={styles.selectedRb} />
                      )}
                    </View>
                    <Text style={styles.radioText}>
                      {generateVisualBadge(option.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.sectionLabel}>Fire Type</Text>
              <View style={styles.optionRow}>
                {FIRE_TYPE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.radioButtonAlt}
                    onPress={() => setFireType(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {fireType === option.value && (
                        <View style={styles.selectedRb} />
                      )}
                    </View>
                    <Text style={styles.radioText}>
                      {generateVisualBadge(option.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          {noChangesAttempted && (
            <View style={styles.alertBox}>
              <FontAwesome
                name="exclamation-circle"
                size={20}
                color="#f87171"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.alertText}>
                No changes detected. Please modify a field before saving.
              </Text>
            </View>
          )}
          {missingFieldsAlert && (
            <View style={styles.alertBox}>
              <FontAwesome
                name="exclamation-triangle"
                size={20}
                color="#facc15"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.alertText}>
                Please select Severity Level, Spread Potential, and Fire Type
                before saving.
              </Text>
            </View>
          )}
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
              onPress={handleSave}
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
                <FontAwesome name="save" size={20} color="#fff" />
                {"  "}
                SAVE
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReset}
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
                <FontAwesome name="refresh" size={20} color="#fff" />
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
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.015,
    marginTop: 2,
    flexWrap: "nowrap",
    gap: 12,
  },
  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#991b1b", // darker version of #f87171
    borderColor: "#991b1b",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
    justifyContent: "center",
  },
  alertText: {
    color: "white",
    fontSize: width * 0.037,
    textAlign: "left",
    flex: 1,
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
  radioButtonAlt: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    minWidth: width * 0.15,
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
  badge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  badgeMuted: {
    backgroundColor: "#64748b",
  },
  badgeSecondary: {
    backgroundColor: "#38bdf8",
  },
  badgeWarning: {
    backgroundColor: "#facc15",
  },
  badgeDanger: {
    backgroundColor: "#ef4444",
  },
});

export default EditReportModal;
