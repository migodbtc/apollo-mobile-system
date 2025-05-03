import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { getSeverityColor, getStatusColor } from "../dash/ReportCard";
import { SelectedReportModalProps } from "@/constants/interfaces/components";

const { width, height } = Dimensions.get("window");

const getConfidenceColor = (score: number) => {
  if (score >= 90) return "#10B981";
  if (score >= 70) return "#3B82F6";
  if (score >= 50) return "#FBBF24";
  return "#EF4444";
};

const SelectedReportModal: React.FC<SelectedReportModalProps> = ({
  visible,
  onClose,
  selectedReport,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedReport ? (
            <>
              <Text style={styles.modalTitle}>Report Details</Text>

              <Text
                style={[styles.verificationTitle, { marginTop: height * 0.03 }]}
              >
                ID & LOCATION
              </Text>
              <View style={styles.twoColumnContainer}>
                <View style={styles.labelColumn}>
                  <Text style={styles.sectionTitle}>Report ID</Text>
                </View>
                <View style={styles.contentColumn}>
                  <Text style={styles.sectionText}>
                    {selectedReport[0]?.PR_report_id}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Location</Text>
              <Text style={styles.sectionText}>
                {selectedReport[0]?.PR_address || "Not specified"}
                {"\n"}
                <Text style={{ color: "#94A3B8", fontSize: width * 0.032 }}>
                  ({selectedReport[0]?.PR_latitude},{" "}
                  {selectedReport[0]?.PR_longitude})
                </Text>
              </Text>

              <Text
                style={[styles.verificationTitle, { marginTop: height * 0.03 }]}
              >
                REPORT STATUS
              </Text>

              <View style={styles.twoColumnContainer}>
                <View style={styles.labelColumn}>
                  <Text style={styles.sectionTitle}>Status</Text>
                </View>
                <View style={styles.contentColumn}>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: getStatusColor(
                          selectedReport[0]?.PR_report_status
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {selectedReport[0]?.PR_report_status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Submitted Section */}
              <View style={styles.twoColumnContainer}>
                <View style={styles.labelColumn}>
                  <Text style={styles.sectionTitle}>Submitted</Text>
                </View>
                <View style={styles.contentColumn}>
                  <Text style={styles.sectionText}>
                    {new Date(selectedReport[0]?.PR_timestamp).toLocaleString(
                      [],
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                </View>
              </View>

              {/* Verification Segment */}
              {selectedReport[1] && selectedReport[1].VR_detected == true ? (
                <>
                  <Text style={[styles.verificationTitle]}>
                    VERIFICATION DETAILS
                  </Text>

                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Severity</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <View style={styles.badgeContent}>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: getSeverityColor(
                                selectedReport[1]?.VR_severity_level
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {selectedReport[1]?.VR_severity_level!.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Confidence</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text
                        style={[
                          styles.sectionText,
                          {
                            color: getConfidenceColor(
                              selectedReport[1]?.VR_confidence_score
                            ),
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {Math.round(selectedReport[1]?.VR_confidence_score)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Fire Type</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedReport[1]?.VR_fire_type!.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Spread Potential</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedReport[1]?.VR_spread_potential!.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.verificationTitle]}>
                    VERIFICATION DETAILS
                  </Text>
                  <Text style={styles.sectionText}>
                    The report has been verified by the system, but no fire has
                    been detected in the reported location.
                  </Text>
                  <Text style={{ color: "#94A3B8", fontSize: width * 0.032 }}>
                    This could mean that the system's analysis confirmed no
                    active fire or smoke within the area at the time of
                    detection, or that the report was a false alarm.
                  </Text>
                </>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Close Report</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noReportText}>No report selected</Text>
          )}
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
  },
  sectionTitle: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#f97316",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: width * 0.038,
    color: "#E2E8F0",
    lineHeight: height * 0.025,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.01,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    paddingVertical: 2,
    marginLeft: width * 0.02,
  },
  badgeText: {
    color: "#F8FAFC",
    fontSize: width * 0.035,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: height * 0.02,
  },
  closeButton: {
    marginTop: height * 0.03,
    backgroundColor: "#f97316",
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: width * 0.042,
    letterSpacing: 0.5,
  },
  noReportText: {
    fontSize: width * 0.04,
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: height * 0.03,
  },
  twoColumnContainer: {
    flexDirection: "row",
    marginBottom: height * 0.01,
  },
  labelColumn: {
    width: "50%",
    justifyContent: "center",
  },
  contentColumn: {
    width: "50%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  badgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  verificationTitle: {
    fontSize: width * 0.032,
    color: "#94a3b8",
    marginBottom: height * 0.015,
    letterSpacing: 0.8,
    marginTop: height * 0.02,
  },
});

export default SelectedReportModal;
