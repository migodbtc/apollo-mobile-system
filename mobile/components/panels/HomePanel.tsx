import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useSession } from "@/constants/contexts/SessionContext";
import UserProfileCard from "../dash/UserProfileCard";
import { Picker } from "@react-native-picker/picker";
import PersonalReportCard from "../dash/PersonalReportCard";
import SERVER_LINK from "@/constants/netvar";
import { PreverifiedReport } from "@/constants/interfaces/database";

const { width, height } = Dimensions.get("window");

const HomePanel = () => {
  const { sessionData } = useSession();
  const [sessionReports, setSessionReports] = useState<PreverifiedReport[]>();
  const [searchType, setSearchType] = useState<string>("id");
  const [searchQuery, setSearchQuery] = useState("");
  const [subSelection, setSubSelection] = useState<number>(0);

  const buttonData = useMemo(
    () => [
      { id: 0, label: "ACCOUNT DETAILS" },
      { id: 1, label: "REPORTS SUBMITTED" },
    ],
    []
  );

  const retrieveUnverifiedReports = async () => {
    const payload = { UA_user_id: sessionData?.UA_user_id };

    try {
      const endpoint = `${SERVER_LINK}/reports/preverified/session`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const reports: PreverifiedReport[] = data.map((report: any) => ({
          PR_report_id: report.PR_report_id,
          PR_user_id: report.PR_user_id,
          PR_image_url: report.PR_image,
          PR_video_url: report.PR_video,
          PR_latitude: parseFloat(report.PR_latitude),
          PR_longitude: parseFloat(report.PR_longitude),
          PR_address: report.PR_address,
          PR_timestamp: new Date(report.PR_timestamp),
          PR_verified: report.PR_verified === 1,
          PR_report_status: report.PR_report_status as
            | "pending"
            | "verified"
            | "false_alarm"
            | "resolved",
        }));

        setSessionReports(reports);
      }
    } catch (error) {
      console.error("Failed to fetch session reports:", error);
      throw error; // Re-throw to be caught by the main error handler
    }
  };

  useEffect(() => {
    if (sessionData?.UA_user_id) {
      retrieveUnverifiedReports();
    }
  }, []);

  const handleSelectionButton = (index: number) => {
    if (index !== subSelection) setSubSelection(index);
    if (index === 1) {
      retrieveUnverifiedReports(); // re-fetch reports when "REPORTS SUBMITTED" is selected
    }
  };

  const handleSearchReport = (query: string) => {
    // Search logic implementation
  };

  const renderAccountDetails = useMemo(() => {
    const labelFontSize = width * 0.03;
    const valueFontSize = width * 0.035;

    return () => (
      <View>
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
                fontSize: labelFontSize,
              }}
            >
              {item.key}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: valueFontSize,
              }}
            >
              {item.value ?? "..."}
            </Text>
          </View>
        ))}
      </View>
    );
  }, [sessionData]);

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
            onValueChange={setSearchType}
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

        {sessionReports?.map((report, index) => (
          <PersonalReportCard
            key={`PRC#${index}`}
            userSubmittedReport={report}
          />
        ))}
      </View>
    );
  }, [searchType, searchQuery, sessionReports]);

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
