import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import { ReportCardProps } from "@/constants/interfaces/components";

const { width, height } = Dimensions.get("window");
const fontSizeBase = width * 0.035;

const capitalize = (text: string) =>
  text.replace(/\b\w/g, (char) => char.toUpperCase());

export const getSeverityColor = (
  severity: PostverifiedReport["VR_severity_level"]
) => {
  const colorMap: Record<string, string> = {
    low: "#F59E0B",
    moderate: "#D97706",
    high: "#B45309",
    critical: "#9A3412",
  };
  return severity && colorMap[severity] ? colorMap[severity] : "#374151";
};

export const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    false_alarm: "#C2410C",
    under_review: "#9A3412",
    verified: "#EA580C",
    pending: "#D97706",
    rejected: "#B45309",
  };
  return colorMap[status] || "#6B7280";
};

const getConfidenceIcon = (score: number) => {
  if (score >= 90) return "check-circle";
  if (score >= 70) return "thumbs-up";
  if (score >= 50) return "exclamation-circle";
  return "question-circle";
};

const StatusBadge = ({ status }: { status: string }) => {
  return (
    <View
      style={{
        backgroundColor: getStatusColor(status),
        borderRadius: 8,
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.004,
        alignSelf: "flex-start",
        marginTop: 4,
      }}
    >
      <Text
        style={{
          color: "#F8FAFC",
          fontSize: fontSizeBase * 0.7,
          fontWeight: "bold",
        }}
      >
        {capitalize(status.replace("_", " "))}
      </Text>
    </View>
  );
};

const ReportCard = ({
  preverified,
  verified = null,
  onClick,
}: ReportCardProps) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={{
        flexDirection: "row",
        overflow: "hidden",
        width: width * 0.9,
        backgroundColor: "#11162B",
        borderRadius: 12,
        marginBottom: height * 0.025,
      }}
    >
      <View
        style={{
          flex: 2,
          paddingHorizontal: width * 0.04,
          paddingVertical: height * 0.035,
          backgroundColor: "#11162B",
          justifyContent: "center",
          paddingBottom: height * 0.03,
        }}
      >
        <Text style={{ color: "#94A3B8", fontSize: fontSizeBase * 0.8 }}>
          Report No {preverified.PR_report_id}
        </Text>
        <Text
          style={{
            color: "#f97316",
            fontWeight: "bold",
            fontSize: fontSizeBase * 1.3,
            marginBottom: 12,
          }}
        >
          {preverified.PR_address || "Unknown Address"}
        </Text>
        <StatusBadge status={preverified.PR_report_status} />
        <Text
          style={{
            color: "#94A3B8",
            fontSize: fontSizeBase * 0.8,
            marginTop: height * 0.01,
          }}
        >
          {new Date(preverified.PR_timestamp).toUTCString()}
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: verified ? "#1E293B" : "#00000000",
          paddingHorizontal: width * 0.02,
          paddingVertical: height * 0.015,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
        }}
      >
        {verified ? (
          verified.VR_detected !== false ? (
            <>
              <Text
                style={{
                  color: getSeverityColor(verified.VR_severity_level),
                  fontWeight: "bold",
                  fontSize: fontSizeBase * 0.9,
                }}
              >
                {capitalize(verified.VR_fire_type ?? "Unknown")}
              </Text>
              <Text style={{ color: "#D1D5DB", fontSize: fontSizeBase * 0.8 }}>
                {capitalize(verified.VR_severity_level ?? "Unknown")}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <FontAwesome
                  name={getConfidenceIcon(verified.VR_confidence_score * 100)}
                  size={16}
                  color="white"
                />
                <Text
                  style={{
                    color: "#F8FAFC",
                    fontSize: fontSizeBase * 0.8,
                    marginLeft: 6,
                  }}
                >
                  {verified.VR_confidence_score}%
                </Text>
              </View>
            </>
          ) : (
            <View style={{ alignItems: "center" }}>
              <FontAwesome name="ban" size={18} color="#DC2626" />
              <Text
                style={{
                  color: "#DC2626",
                  fontSize: fontSizeBase * 0.8,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                No fire detected
              </Text>
            </View>
          )
        ) : (
          <View style={{ alignItems: "center" }}>
            <FontAwesome name="times-circle" size={18} color="#9CA3AF" />
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: fontSizeBase * 0.8,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              Pending verification...
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ReportCard;
