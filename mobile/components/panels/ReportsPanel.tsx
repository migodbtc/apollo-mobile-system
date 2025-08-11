import React, { useCallback, useEffect, useRef, useMemo, useState } from "react";
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
import { EditReportModal } from "../dash/EditReportModal";
import { EditPostReportModal } from "../dash/EditPostReportModal";
import type { ReportStatus } from "@/constants/interfaces/database";
import { Animated } from "react-native";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";





const { width, height } = Dimensions.get("window");

const ReportsPanel = () => {
  // Session context
  const { sessionData } = useSession();
  const {combinedReports, fetchPostverifiedReports, fetchPreverifiedReports} = useAdminSQL();



 

  // Data states
  const [preverifiedReports, setPreverifiedReports] = useState<
    PreverifiedReport[]
  >([]);
  const [verifiedReports, setVerifiedReports] = useState<PostverifiedReport[]>(
    []
  );



  // Callback function to handle post-edit click
  const handlePostEditClick = (postReport: PostverifiedReport | null) => {
    if (!postReport) return;
    setSelectedPostReport(postReport);
    setIsPostEditModalVisible(true);
  };

  // UI states
  const [selectedReport, setSelectedReport] = useState<
    [PreverifiedReport, PostverifiedReport | null] | null
  >(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [showVerified, setShowVerified] = useState(true);
  const [isPostEditModalVisible, setIsPostEditModalVisible] = useState(false);
  const [selectedPostReport, setSelectedPostReport] = useState<PostverifiedReport | null>(null);
  //for toggle animation to hehe
  const toggleTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const toggleWidthValue = width * 0.15;
    const circleSizeValue = height * 0.02;
  
    Animated.timing(toggleTranslateX, {
      toValue: showVerified ? toggleWidthValue - circleSizeValue - 4 : 4,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [showVerified]);

  const isAdmin =
    sessionData?.UA_user_role &&
    ["admin", "superadmin", "responder"].includes(
      sessionData.UA_user_role.toLowerCase()
    );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Report combination
  
  
  



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
    fetchPreverifiedReports();
    fetchPostverifiedReports();
  }, []);

  // Handle report click callback hook to prevent unnecessary new 'handleReportClick' renders
  const handleReportClick = useCallback(
    (report: [PreverifiedReport, PostverifiedReport | null]) => {
      setSelectedReport(report);
      setIsReportModalVisible(true);
    },
    []
  );

  // Handle edit save function to update the report status kapag nasave na sa edit modal
  const handleEditSave = async (updatedData: { status: ReportStatus }) => {
    if (!selectedReport) return;
  
    const updatedPre = {
      ...selectedReport[0],
      PR_report_status: updatedData.status,
    };
  
    await fetch(`${SERVER_LINK}/reports/preverified/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPre),
    });
  
    if (updatedData.status === "verified") {
      await fetch(`${SERVER_LINK}/reports/postverified/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          VR_report_id: selectedReport[0].PR_report_id,
          VR_confidence_score: 0.9,
          VR_detected: true,
          VR_verification_timestamp: new Date().toISOString(),
          VR_severity_level: "low",
          VR_spread_potential: "low",
          VR_fire_type: "wildfire",
        }),
      });
    }
  
    await refreshReports(); // Refetches both reports (preverified and postverified)
    setIsEditModalVisible(false);
  };

  const handlePostEditSave = async (updatedData: Partial<PostverifiedReport>) => {
    if (!selectedPostReport) return;
  
    try {
      // 1. Update backend
      const response = await fetch(`${SERVER_LINK}/reports/postverified/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          VR_verification_id: selectedPostReport.VR_verification_id,
          updatedData.
        }),
      });
  
      // 2. Update LOCAL state
      setVerifiedReports(prev => 
        prev.map(report => ({
          ...report,
          ...(report.VR_verification_id === selectedPostReport.VR_verification_id 
            ? updatedData 
            : {})
        }))
      );
  
      // 3. Sync PREVERIFIED status - THIS IS THE KEY FIX
      if (updatedData.VR_status) {
        setPreverifiedReports(prev =>
          prev.map(report => 
            report.PR_report_id === selectedPostReport.VR_report_id
              ? {
                  ...report,
                  PR_report_status: mapPostToPreStatus(updatedData.VR_status || '')
                }
              : report
          )
        );
      }
  
      setIsPostEditModalVisible(false);
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to save changes.");
    }
  };
  
  // Add this helper function
  const mapPostToPreStatus = (postStatus: string) => {
    switch(postStatus) {
      case 'false_alarm': return 'false_alarm';
      case 'resolved': return 'resolved'; // Make sure this matches your preverified statuses
      default: return 'verified';
    }
  };
  
  

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
        PR_image: report["PR_image"],
        PR_video: report["PR_video"],
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
      VR_status: report.VR_status || "validated",
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

        {/* Additional Filter TOGGLE */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setShowVerified(prev => !prev)}
            activeOpacity={0.8}
            style={[
              styles.toggleSwitch,
              { backgroundColor: showVerified ? "#f97316" : "#64748b" },
            ]}
          >
            <Animated.View
              style={[
                styles.toggleCircle,
                {
                  transform: [{ translateX: toggleTranslateX }],
                },
              ]}
            />
          </TouchableOpacity>

          <Text style={styles.toggleLabel}>
            {showVerified ? "Showing Verified Reports" : "Showing Unverified Reports"}
          </Text>
        </View>

        {/* Render Report Cards or Empty State */}
        {combinedReports.filter((report) =>
          showVerified
            ? report[1] !== null
            : report[1] === null && report[0].PR_report_status === "pending"
        ).length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="exclamation" size={width * 0.15} color="#64748B" />
            <Text style={styles.emptyText}>
              {showVerified
                ? "No verified reports available today."
                : "No unverified reports available today"}
            </Text>
            <Text style={styles.emptySubtext}>
              {showVerified
                ? "Try switching back to unverified or check again later."
                : "There are currently no pending fire reports."}
            </Text>
          </View>
        ) : (
          combinedReports
            .filter((report) =>
              showVerified
                ? report[1] !== null
                : report[1] === null && report[0].PR_report_status === "pending"
            )
            .map((report, index) => (
              <ReportCard
                key={`${report[0].PR_report_id}-${index}`}
                preverified={report[0]}
                verified={report[1]}
                onClick={() => handleReportClick(report)}
                setIsEditModalVisible={setIsEditModalVisible}
                setSelectedReport={setSelectedReport}
                isAdmin={isAdmin}
                onPostEditClick={() => handlePostEditClick(report[1]!)}
                showPreverified={!showVerified}
                showPostverified={showVerified}
              />
            ))
        )}



      </ScrollView>

      {/* Help Modal */}
      <ReportHelpModal visible={isHelpModalVisible} onClose={toggleHelpModal} />

      {/* Selected Report Modal */}
      <SelectedReportModal
        visible={isReportModalVisible}
        onClose={closeReportModal}
        selectedReport={selectedReport}
      />

      {/* Edit Report Modal */}
      <EditReportModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        reportData={selectedReport}
        onSave={handleEditSave}
      />

      {/* Edit Post Report Modal */}
      <EditPostReportModal
        visible={isPostEditModalVisible}
        onClose={() => setIsPostEditModalVisible(false)}
        reportData={selectedReport}
        onSave={handlePostEditSave}
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
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start", 
    marginVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    gap: width * 0.03, 
  },
  toggleLabel: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: "#f97316",
  },
  toggleSwitch: {
    width: width * 0.15,
    height: height * 0.03,
    borderRadius: (height * 0.03) / 2,
    padding: 2,
    justifyContent: "center",
  },
  toggleCircle: {
    width: width * 0.045,
    height: height * 0.020,
    borderRadius: (height * 0.020) / 2,
    backgroundColor: "#fff",
    position: "absolute",
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
  emptyContainer: {
    flex: 1,
    height: height * 0.2,
    justifyContent: "center",
    alignItems: "center",
    marginTop: height * 0.04,
    paddingHorizontal: width * 0.1,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: width * 0.0425,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#64748B",
    fontSize: width * 0.03,
    marginTop: 10,
    textAlign: "center",
  },
});

export default ReportsPanel;
