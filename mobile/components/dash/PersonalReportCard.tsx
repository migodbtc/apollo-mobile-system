import { View, Text, Dimensions } from "react-native";
import React from "react";
import { PersonalReportCardProps } from "@/constants/interfaces/components";

const { width, height } = Dimensions.get("window");

const PersonalReportCard: React.FC<PersonalReportCardProps> = ({
  userSubmittedReport,
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        backgroundColor: "#1E293B",
        borderRadius: width * 0.03,
        marginBottom: height * 0.02,
        padding: width * 0.05,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: "#F97316",
            fontWeight: "bold",
            fontSize: width * 0.04,
            marginBottom: height * 0.01,
          }}
        >
          REPORT NO. {userSubmittedReport.PR_report_id}
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: width * 0.035,
            marginBottom: height * 0.01,
          }}
        >
          Address:{" "}
          {userSubmittedReport.PR_address ? (
            <>
              <Text>{userSubmittedReport.PR_address} </Text>
              <Text style={{ color: "#9CA3AF", fontSize: width * 0.03 }}>
                ({userSubmittedReport.PR_latitude.toFixed(4)},{" "}
                {userSubmittedReport.PR_longitude.toFixed(4)})
              </Text>
            </>
          ) : (
            <Text style={{ color: "#F59E0B" }}>
              {userSubmittedReport.PR_latitude.toFixed(4)},{" "}
              {userSubmittedReport.PR_longitude.toFixed(4)}
            </Text>
          )}
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: width * 0.035,
            marginBottom: height * 0.01,
          }}
        >
          Media Type:{" "}
          <Text
            style={{
              color: "#F59E0B",
              fontWeight: "bold",
            }}
          >
            {userSubmittedReport.PR_image
              ? "Image"
              : userSubmittedReport.PR_video
              ? "Video"
              : "None"}
          </Text>
        </Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: width * 0.035,
            marginBottom: height * 0.01,
          }}
        >
          Status:{" "}
          <Text
            style={{
              color:
                userSubmittedReport.PR_report_status === "verified"
                  ? "#10B981"
                  : userSubmittedReport.PR_report_status === "pending"
                  ? "#F59E0B"
                  : "#EF4444",
              fontWeight: "bold",
            }}
          >
            {userSubmittedReport.PR_report_status.toUpperCase()}
          </Text>
        </Text>
        <Text
          style={{
            color: "#9CA3AF",
            fontSize: width * 0.03,
          }}
        >
          Timestamp:{" "}
          {new Date(userSubmittedReport.PR_timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

export default PersonalReportCard;
