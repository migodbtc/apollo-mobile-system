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
import PersonalReportCard from "../dash/PersonalReportCard";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";
import { PreverifiedReport } from "@/constants/types/database";

const { width, height } = Dimensions.get("window");

const HomePanel = () => {
  const { sessionData } = useSession();
  const {
    preverifiedReports,
    loading,
    errors,
    fetchPreverifiedReports,
    getPreverifiedReportById,
  } = useAdminSQL();

  const [showAlert, setShowAlert] = useState(true);
  const [accordionOpen, setAccordionOpen] = useState(false);

  const [searchType, setSearchType] = useState<string>("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [subSelection, setSubSelection] = useState<number>(0);
  const [filteredReports, setFilteredReports] = useState<PreverifiedReport[]>(
    []
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
    if (preverifiedReports && sessionData?.UA_user_id) {
      const userReports = preverifiedReports.filter(
        (report) => report.PR_user_id === sessionData.UA_user_id
      );
      setFilteredReports(userReports);
    }
  }, [preverifiedReports, sessionData?.UA_user_id]);

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

  const handleSearchReport = (query: string) => {
    if (!query.trim()) {
      setFilteredReports(
        preverifiedReports?.filter(
          (report) => report.PR_user_id === sessionData?.UA_user_id
        ) || []
      );
      return;
    }

    const filtered =
      preverifiedReports
        ?.filter((report) => report.PR_user_id === sessionData?.UA_user_id)
        ?.filter((report) => {
          switch (searchType) {
            case "id":
              return report.PR_report_id.toString().includes(query);
            case "date":
              return report.PR_timestamp.toString().includes(query);
            case "address":
              return report.PR_address.toLowerCase().includes(
                query.toLowerCase()
              );
            case "status":
              return report.PR_report_status.toLowerCase().includes(
                query.toLowerCase()
              );
            default:
              return true;
          }
        }) || [];

    setFilteredReports(filtered);
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
        {/* Profile operations */}
        <View
          style={{
            marginHorizontal: 10,
            marginBottom: 10,
            marginTop: 32,
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              paddingHorizontal: 16,
              justifyContent: "center",
              minWidth: "40%",
              maxWidth: "50%",

              borderWidth: 2,
              borderColor: "#c2410c",
              borderRadius: 12,
            }}
            activeOpacity={0.8}
            // onPress={handleEditProfile} // Add your handler here
          >
            <FontAwesome
              name="edit"
              size={22}
              color="#c2410c"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: "#c2410c",
                fontWeight: "bold",
                fontSize: width * 0.035,
              }}
            >
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [sessionData, accordionOpen]);

  const renderAccountReports = useMemo(() => {
    return () => (
      <View>
        <View
          style={{
            flexDirection: "row",
            height: height * 0.075,
            alignItems: "center",
            backgroundColor: "#1E293B",
            borderRadius: width * 0.04,
            paddingHorizontal: width * 0.03,
            marginBottom: width * 0.04,
          }}
        >
          <FontAwesome
            name="filter"
            size={width * 0.05}
            color="#F97316"
            style={{ marginRight: width * 0.005, marginLeft: width * 0.045 }}
          />

          <Picker
            selectedValue={searchType}
            onValueChange={(itemValue) => {
              setSearchType(itemValue);
              setSearchQuery(""); // Reset search query when type changes
              handleSearchReport(""); // Reset filtered results
            }}
            style={{
              flex: 1,
              color: "white",
              fontSize: width * 0.035,
            }}
            dropdownIconColor="#F97316"
          >
            <Picker.Item label="Search by ID" value="id" />
            <Picker.Item label="Search by Date" value="date" />
            <Picker.Item label="Search by Address" value="address" />
            <Picker.Item label="Search by Status" value="status" />
          </Picker>

          <TextInput
            style={{
              flex: 7,
              height: "100%",
              color: "white",
              fontSize: width * 0.035,
              paddingVertical: width * 0.01,
            }}
            placeholder={`Search by ${searchType.toUpperCase()}...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearchReport(text);
            }}
          />
        </View>

        {loading.preverifiedReports ? (
          <Text style={{ color: "white", textAlign: "center", padding: 20 }}>
            Loading reports...
          </Text>
        ) : errors.preverifiedReports ? (
          <Text style={{ color: "red", textAlign: "center", padding: 20 }}>
            Error: {errors.preverifiedReports}
          </Text>
        ) : filteredReports.length === 0 ? (
          <Text style={{ color: "white", textAlign: "center", padding: 20 }}>
            No reports found
          </Text>
        ) : (
          filteredReports.map((report, index) => (
            <PersonalReportCard
              key={`PRC#${index}`}
              userSubmittedReport={report}
            />
          ))
        )}
      </View>
    );
  }, [
    searchType,
    searchQuery,
    filteredReports,
    loading.preverifiedReports,
    errors.preverifiedReports,
  ]);

  return (
    <ScrollView
      style={{ flex: 1, width: "100%", height: "100%" }}
      contentContainerStyle={{
        justifyContent: "flex-start",
        alignItems: "center",
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.05,
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
