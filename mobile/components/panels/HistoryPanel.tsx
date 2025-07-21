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
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";

const { width, height } = Dimensions.get("window");

const HistoryPanel = () => {
  // Session context
  const { sessionData } = useSession();

  // UI states
  const [selectedReport, setSelectedReport] = useState<
    [PreverifiedReport, PostverifiedReport | null] | null
  >(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isEditModaVisible, setIsEditModalVisible] = useState(false);
  const [showPreverified, setShowPreverified] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    preverifiedReports,
    postverifiedReports,
    combinedReports,
    fetchPreverifiedReports,
    fetchPostverifiedReports,
    combineReports,
  } = useAdminSQL();

  // Data fetching use effect to get the infrormation from the database
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        fetchPreverifiedReports();
        fetchPostverifiedReports();
        combineReports();
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
              History Page
            </Text>

            <Text style={styles.headerSubtitle}>
              Showing all previous reports submitted by all users of Apollo.
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

        {/* Render Report Cards or Empty State */}
        {combinedReports.filter(
          (report) => report[1] !== null || showPreverified
        ).length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome
              name="exclamation"
              size={width * 0.15}
              color="#64748B"
            />
            <Text style={styles.emptyText}>
              {showPreverified
                ? "No reports available."
                : "No verified reports available."}
            </Text>
            <Text style={styles.emptySubtext}>
              {showPreverified
                ? "There are currently no fire reports submitted within the database."
                : "Try showing unverified reports or check back later."}
            </Text>
          </View>
        ) : (
          combinedReports
            .filter((report) => report[1] !== null || showPreverified)
            .map((report, index) => (
              <ReportCard
                key={`${report[0].PR_report_id}-${index}`}
                preverified={report[0]}
                verified={report[1]}
                onClick={() => handleReportClick(report)}
                setIsEditModalVisible={setIsEditModalVisible}
              />
            ))
        )}
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
    width: "70%",
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

export default HistoryPanel;
