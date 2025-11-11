import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useSession } from "@/constants/contexts/SessionContext";
import UserProfileCard from "../dash/UserProfileCard";
import { Picker } from "@react-native-picker/picker";
import ReportCard from "../dash/ReportCard";
import SelectedReportModal from "../dash/SelectedReportModal";
import EditReportModal from "../dash/EditReportModal";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";
import { PreverifiedReport, CombinedReport } from "@/constants/types/database";

const { width, height } = Dimensions.get("window");

const HomePanel = () => {
  const { sessionData } = useSession();
  const {
    preverifiedReports,
    combinedReports,
    loading,
    errors,
    fetchPreverifiedReports,
    getPreverifiedReportById,
  } = useAdminSQL();

  const [showAlert, setShowAlert] = useState(true);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const [subSelection, setSubSelection] = useState<number>(0);
  const [filteredReports, setFilteredReports] = useState<CombinedReport[]>([]);
  // State for EditReportModal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editReportData, setEditReportData] = useState<CombinedReport | null>(
    null
  );

  const buttonData = useMemo(
    () => [
      { id: 0, label: "ACCOUNT DETAILS" },
      { id: 1, label: "REPORTS SUBMITTED" },
    ],
    []
  );

  // Use a ref to track if we should fetch reports
  const shouldFetchReports = useRef(true);

  // Filter reports by current user
  useEffect(() => {
    // Use combinedReports (pre + post) and filter by current user
    if (combinedReports && sessionData?.UA_user_id) {
      const userReports = combinedReports.filter(
        (reportTuple) => reportTuple[0].PR_user_id === sessionData.UA_user_id
      );
      setFilteredReports(userReports);
    }
  }, [combinedReports, sessionData?.UA_user_id]);

  // Fetch reports only when needed
  useEffect(() => {
    if (sessionData?.UA_user_id && shouldFetchReports.current) {
      fetchPreverifiedReports();
      shouldFetchReports.current = false;
    }
  }, [sessionData?.UA_user_id, fetchPreverifiedReports]);

  const handleSelectionButton = (index: number) => {
    if (index !== subSelection) setSubSelection(index);
    if (index === 1) {
      shouldFetchReports.current = true;
      fetchPreverifiedReports();
    }
  };

  const handleEditSave = (updatedData: any) => {
    //pwede dito ilagay yunhg save logic or kahit saan mo trip bahala ka sa buhay mo hehe
    console.log("Saved data:", updatedData);
    setIsEditModalVisible(false);
  };

  const renderAccountDetails = useMemo(() => {
    return () => (
      <View>
        {showAlert && (
          <View
            style={{
              marginHorizontal: 0,
              marginBottom: 10,
              marginTop: 2,
              backgroundColor: "transparent",
              overflow: "hidden",
            }}
          >
            {/* Accordion Header */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 12,
              }}
              onPress={() => setAccordionOpen((prev) => !prev)}
              activeOpacity={0.8}
            >
              <FontAwesome name="info-circle" size={20} color="#22c55e" />
              <Text
                style={{
                  color: "#22c55e",
                  fontWeight: "bold",
                  fontSize: width * 0.035,
                  marginLeft: 8,
                  flex: 1,
                }}
              >
                Account Setup Reminder
              </Text>
              {/* Dash Button to close */}
              <TouchableOpacity
                onPress={() => setShowAlert(false)}
                activeOpacity={0.8}
                style={{ marginLeft: 8 }}
              >
                <FontAwesome
                  name="minus"
                  size={width * 0.04}
                  color="#22c55e"
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
              <FontAwesome
                name={accordionOpen ? "chevron-up" : "chevron-down"}
                size={width * 0.04}
                color="#22c55e"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
            {/* Accordion Content */}
            {accordionOpen && (
              <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
                <Text
                  style={{
                    color: "white",
                    fontSize: width * 0.035,
                    fontStyle: "italic",
                  }}
                >
                  Complete the setup of your account by submitting personal
                  information, which in turn will increase your reputation score
                  and make your account and reports more credible and trusted!
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: width * 0.035,
                    fontWeight: "bold",
                    marginTop: 16,
                  }}
                >
                  EDIT YOUR ACCOUNT INFORMATION WITH THE PROFILE BUTTON BELOW!
                </Text>
              </View>
            )}
          </View>
        )}

        {[
          { key: "User ID", value: sessionData?.UA_user_id },
          { key: "Last Name", value: sessionData?.UA_last_name },
          { key: "First Name", value: sessionData?.UA_first_name },
          { key: "Middle Name", value: sessionData?.UA_middle_name },
          { key: "Suffix", value: sessionData?.UA_suffix },
          { key: "Phone", value: sessionData?.UA_phone_number },
          {
            key: "Reputation Score",
            value: sessionData?.UA_reputation_score ?? "...",
          },
        ].map((item) => (
          <View
            key={item.key}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: "#1e293b",
              paddingVertical: 5,
              paddingHorizontal: 10,
            }}
          >
            <Text
              style={{
                color: "#fb923c",
                fontWeight: "bold",
                fontSize: width * 0.035,
              }}
            >
              {item.key}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: width * 0.035,
              }}
            >
              {item.value ?? "  "}
            </Text>
          </View>
        ))}
        {/* Edit Account Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderTopWidth: 1,
            borderTopColor: "#1e293b",
          }}
        >
          <Text
            style={{
              color: "#fb923c",
              fontWeight: "bold",
              fontSize: width * 0.035,
            }}
          >
            Update Account
          </Text>
          <TouchableOpacity
            style={{
              borderWidth: 2,
              borderColor: "#c2410c",
              borderRadius: 12,
              padding: 2,
              paddingHorizontal: 12,
              backgroundColor: "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
            // onPress={handleEditProfile} // Add your handler here
          >
            <Text style={{ color: "#c2410c", fontSize: width * 0.035 }}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [sessionData, showAlert, accordionOpen]);

  const [reportSearch, setReportSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<CombinedReport | null>(
    null
  );
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const filteredUserReports = useMemo(() => {
    if (!reportSearch.trim()) return filteredReports;
    return filteredReports.filter((reportTuple) => {
      const pre = reportTuple[0];
      return (
        pre.PR_address &&
        pre.PR_address.toLowerCase().includes(reportSearch.toLowerCase())
      );
    });
  }, [filteredReports, reportSearch]);

  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(filteredUserReports.length / pageSize) || 1;
  const paginatedReports = filteredUserReports.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const renderAccountReports = () => (
    <View>
      {/* Search bar (like PrivilegesPanel) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#1a2232",
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#334155",
          paddingVertical: 2,
          paddingHorizontal: 2,
          marginBottom: 12,
        }}
      >
        <FontAwesome
          name="search"
          size={width * 0.045}
          color="#94A3B8"
          style={{ marginLeft: 8, marginRight: 8 }}
        />
        <TextInput
          style={{
            flex: 1,
            backgroundColor: "transparent",
            color: "#fff",
            fontSize: width * 0.035,
            paddingVertical: 8,
            paddingHorizontal: 0,
          }}
          placeholder="Enter the address of the report you'd like to search"
          placeholderTextColor="#94A3B8"
          value={reportSearch}
          onChangeText={setReportSearch}
        />
      </View>
      {/* Render user's reports with pagination */}
      {filteredUserReports.length === 0 ? (
        <Text style={{ color: "#9CA3AF", textAlign: "center", marginTop: 24 }}>
          No reports found.
        </Text>
      ) : (
        <>
          {paginatedReports.map((reportTuple, idx) => {
            const [pre, post] = reportTuple;
            return (
              <View key={`report-card-${pre.PR_report_id}-${idx}`}>
                <ReportCard
                  preverified={pre}
                  verified={post}
                  setIsEditModalVisible={() => {
                    setEditReportData([pre, post]);
                    setIsEditModalVisible(true);
                  }}
                  onClick={() => {
                    setSelectedReport([pre, post]);
                    setIsReportModalVisible(true);
                  }}
                />
              </View>
            );
          })}
          {/* Edit Report Modal (moved to bottom) */}
          {/* Pagination Controls */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 16,
            }}
          >
            {/* First Page Button */}
            <TouchableOpacity
              onPress={() => setPage(1)}
              disabled={page === 1}
              style={{
                opacity: page === 1 ? 0.5 : 1,
                marginHorizontal: 4,
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: "#f97316",
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: "#f97316", fontWeight: "bold" }}>
                {"<<"}
              </Text>
            </TouchableOpacity>
            {/* Prev Button */}
            <TouchableOpacity
              onPress={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                opacity: page === 1 ? 0.5 : 1,
                marginHorizontal: 4,
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: "#f97316",
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ color: "#f97316", fontWeight: "bold" }}>Prev</Text>
            </TouchableOpacity>
            <Text
              style={{
                color: "#f97316",
                fontWeight: "bold",
                marginHorizontal: 12,
              }}
            >
              Page {page} / {totalPages}
            </Text>
            {/* Next Button */}
            <TouchableOpacity
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                opacity: page === totalPages ? 0.5 : 1,
                marginHorizontal: 4,
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: "#f97316",
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ color: "#f97316", fontWeight: "bold" }}>Next</Text>
            </TouchableOpacity>
            {/* Last Page Button */}
            <TouchableOpacity
              onPress={() => setPage(totalPages)}
              disabled={page === totalPages}
              style={{
                opacity: page === totalPages ? 0.5 : 1,
                marginHorizontal: 4,
                backgroundColor: "transparent",
                borderWidth: 2,
                borderColor: "#f97316",
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: "#f97316", fontWeight: "bold" }}>
                {">>"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {/* Selected Report Modal */}
      <SelectedReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        selectedReport={selectedReport}
      />

      {/* Edit Report Modal (single instance) */}
      <EditReportModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        reportData={editReportData ?? selectedReport}
        onSave={handleEditSave}
      />
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1, width: "100%", height: "100%" }}
      contentContainerStyle={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.05,
        paddingBottom: height * 0.1,
      }}
      showsVerticalScrollIndicator={true}
    >
      <UserProfileCard />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          height: height * 0.05,
        }}
      >
        {buttonData.map((button) => (
          <TouchableOpacity
            key={button.id}
            onPress={() => handleSelectionButton(button.id)}
            style={{
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              flex: 1,
              borderRadius: 16,
              backgroundColor:
                subSelection === button.id ? "#c2410c" : "#11162B",
              marginHorizontal: width * 0.01,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: width * 0.035,
                color: subSelection === button.id ? "#11162B" : "#c2410c",
              }}
            >
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ width: "100%", paddingVertical: 20 }}>
        {subSelection === 0 ? renderAccountDetails() : renderAccountReports()}
      </View>
    </ScrollView>
  );
};

export default HomePanel;
