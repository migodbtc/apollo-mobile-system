import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import ReportCard from "../dash/ReportCard";
import SelectedReportModal from "../dash/SelectedReportModal";
import SERVER_LINK from "@/constants/netvar";
import { useSession } from "@/constants/contexts/SessionContext";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import ReportHelpModal from "../dash/ReportHelpModal";

const { width, height } = Dimensions.get("window");

const ReportsPanel = () => {
  // Session context
  const { sessionData } = useSession();

  // Data states
  const [preverifiedReports, setPreverifiedReports] = useState<
    PreverifiedReport[]
  >([]);
  const [verifiedReports, setVerifiedReports] = useState<PostverifiedReport[]>(
    []
  );

  // UI states
  const [selectedReport, setSelectedReport] = useState<
    [PreverifiedReport, PostverifiedReport | null] | null
  >(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [showPreverified, setShowPreverified] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const combinedReports = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const filteredPreverified = preverifiedReports.filter((preverified) => {
      const prDate = new Date(preverified.PR_timestamp)
        .toISOString()
        .slice(0, 10);
      const isToday = prDate === today;
      return isToday;
    });

    const result = filteredPreverified.map((preverified) => {
      const prDate = new Date(preverified.PR_timestamp)
        .toISOString()
        .slice(0, 10);

      const verified = verifiedReports.find((v) => {
        const vrDate = new Date(v.VR_verification_timestamp)
          .toISOString()
          .slice(0, 10);
        const idMatch = v.VR_report_id === preverified.PR_report_id;
        const dateMatch = vrDate === prDate;

        return idMatch && dateMatch;
      });

      return [preverified, verified ?? null] as [
        PreverifiedReport,
        PostverifiedReport | null
      ];
    });

    return result;
  }, [preverifiedReports, verifiedReports, showPreverified]);

  // Data fetching use effect to get the infrormation from the database
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [preverified, postverified] = await Promise.all([
          fetchUnverifiedReports(),
          fetchVerifiedReports(),
        ]);

        if (isMounted) {
          setPreverifiedReports(preverified);
          setVerifiedReports(postverified);
        }
      } catch (error) {
        if (isMounted) {
          setError("Failed to load reports. Please try again.");
          console.error("Error fetching reports:", error);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const refreshReports = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Handle report click callback hook to prevent unnecessary new 'handleReportClick' renders
  const handleReportClick = useCallback(
    (report: [PreverifiedReport, PostverifiedReport | null]) => {
      setSelectedReport(report);
      setIsReportModalVisible(true);
    },
    []
  );

  const toggleHelpModal = useCallback(() => {
    setIsHelpModalVisible((prev) => !prev);
  }, []);

  const closeReportModal = useCallback(() => {
    setIsReportModalVisible(false);
  }, []);

  // API call functions
  const fetchUnverifiedReports = async (): Promise<PreverifiedReport[]> => {
    try {
      const response = await fetch(`${SERVER_LINK}/reports/preverified/all`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.map((report: any) => ({
        PR_report_id: report["PR_report_id"],
        PR_user_id: report["PR_user_id"],
        PR_image_url: report["PR_image_url"],
        PR_video_url: report["PR_video_url"],
        PR_latitude: parseFloat(report["PR_latitude"]),
        PR_longitude: parseFloat(report["PR_longitude"]),
        PR_address: report["PR_address"],
        PR_timestamp: new Date(report["PR_timestamp"]),
        PR_verified: report["PR_verified"] === 1,
        PR_report_status: report["PR_report_status"] as
          | "pending"
          | "verified"
          | "false_alarm"
          | "resolved",
      }));
    } catch (error) {
      console.error("Failed to fetch unverified reports:", error);
      throw error; // Re-throw to be caught by the main error handler
    }
  };

  const fetchVerifiedReports = async (): Promise<PostverifiedReport[]> => {
    const response = await fetch(`${SERVER_LINK}/reports/postverified/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch verified reports");

    const data = await response.json();

    return data.map((report: any) => ({
      VR_verification_id: report["VR_verification_id"],
      VR_report_id: report["VR_report_id"],
      VR_confidence_score: parseFloat(report["VR_confidence_score"]),
      VR_detected: report["VR_detected"] === 1,
      VR_verification_timestamp: new Date(report["VR_verification_timestamp"]),
      VR_severity_level: report["VR_severity_level"] as
        | "low"
        | "moderate"
        | "high"
        | "critical",
      VR_spread_potential: report["VR_spread_potential"] as
        | "low"
        | "moderate"
        | "high",
      VR_fire_type: report["VR_fire_type"],
    }));
  };

  // Date formatting memoized
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              <FontAwesome name="file" size={width * 0.055} />
              {"  "}
              Reports Page
            </Text>

            <Text style={styles.headerSubtitle}>
              Showing reports for {formattedDate}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={toggleHelpModal}
            >
              <Text style={styles.helpButtonText}>
                <FontAwesome
                  name="question-circle"
                  size={width * 0.035}
                  color="#11162B"
                />
                {"  "}
                HELP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={refreshReports}
              disabled={isLoading}
            >
              <Text style={styles.helpButtonText}>
                <FontAwesome
                  name="refresh"
                  size={width * 0.035}
                  color={isLoading ? "#64748B" : "#11162B"}
                />
                {"  "}
                {isLoading ? "Refreshing..." : "Refresh"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Filter Checkboxes */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setShowPreverified(!showPreverified)}
          >
            <View
              style={[
                styles.checkboxIcon,
                showPreverified && styles.checkboxIconChecked,
              ]}
            >
              {showPreverified && (
                <FontAwesome name="check" size={width * 0.03} color="#f97316" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Show unverified reports</Text>
          </TouchableOpacity>
        </View>

        {/* Render Report Cards */}
        {combinedReports
          .filter((report) => report[1] !== null || showPreverified)
          .map((report, index) => (
            <ReportCard
              key={`${report[0].PR_report_id}-${index}`}
              preverified={report[0]}
              verified={report[1]}
              onClick={() => handleReportClick(report)}
            />
          ))}
      </ScrollView>

      {/* Help Modal */}
      <ReportHelpModal visible={isHelpModalVisible} onClose={toggleHelpModal} />

      <SelectedReportModal
        visible={isReportModalVisible}
        onClose={closeReportModal}
        selectedReport={selectedReport}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: "5%",
    width: "100%",
  },
  headerCard: {
    width: "100%",
    height: height * 0.225,
    backgroundColor: "#11162B",
    borderRadius: 12,
    overflow: "hidden",
    paddingBottom: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "80%",
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
  },
  headerTitle: {
    width: "100%",
    color: "#f97316",
    fontSize: width * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
  headerSubtitle: {
    color: "#94A3B8",
    fontSize: width * 0.03,
    textAlign: "center",
    marginTop: 8,
  },
  headerActions: {
    flexDirection: "row",
    width: "100%",
    height: "30%",
    paddingBottom: 12,
    gap: width * 0.0125,
    paddingHorizontal: width * 0.1,
    alignItems: "center",
    justifyContent: "center",
  },
  helpButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "40%",
    borderRadius: 16,
    backgroundColor: "#42475A",
    marginHorizontal: width * 0.01,
    paddingVertical: height * 0.01,
  },
  helpButtonText: {
    fontWeight: "bold",
    fontSize: width * 0.035,
    color: "#11162B",
  },
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
  modalText: {
    fontSize: width * 0.035,
    color: "#FFFFFF",
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 12,
    paddingHorizontal: width * 0.02,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxIcon: {
    width: width * 0.05,
    height: width * 0.05,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#f97316",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#11162B",
  },
  checkboxIconChecked: {
    backgroundColor: "#11162B",
  },
  checkboxLabel: {
    color: "#94A3B8",
    fontSize: width * 0.035,
  },
  refreshButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "40%",
    borderRadius: 16,
    backgroundColor: "#42475A",
    marginHorizontal: width * 0.01,
    paddingVertical: height * 0.01,
  },
});

export default ReportsPanel;
