import { View, Text, TouchableOpacity } from "react-native";
import { useSession } from "@/constants/contexts/SessionContext"; //eto na yung usesession hehehe
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import { ReportCardProps } from "@/constants/interfaces/components";
import {EditReportModal} from "./EditReportModal"; 

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
  onDelete,
}: ReportCardProps) => {
  const { sessionData } = useSession();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  // Depende kung sino naka login, this is to determine wether the user is admin, superadmin, or responder
  const isAdmin =
    sessionData?.UA_user_role &&
    ["admin", "superadmin", "responder"].includes(
      sessionData.UA_user_role.toLowerCase()
    );

  const handleSave = (updatedData: any) => {
    //pwede dito ilagay yunhg save logic or kahit saan mo trip bahala ka sa buhay mo hehe 
    console.log("Saved data:", updatedData);
    setIsEditModalVisible(false);
  };

  return (
    <View style={{ alignItems: "center" }}>
      <TouchableOpacity
        onPress={onClick}
        style={{
          flexDirection: "row",
          overflow: "hidden",
          width: width * 0.9,
          height: height * 0.21,
          backgroundColor: "#11162B",
          borderRadius: 12,
          marginBottom: height * 0.015,
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

          {/**start ng code for the admin controls depending on the role of the user */}  
          {isAdmin && (
            <View
              style={{
                marginTop: height * 0.015,
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(true)}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f97316",
                  paddingVertical: height * 0.006,
                  paddingHorizontal: width * 0.04,
                  marginBottom: height * 0.01,
                  borderRadius: 10,
                }}
              >
                <FontAwesome
                  name="edit"
                  size={fontSizeBase * 0.75}
                  color="white"
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: fontSizeBase * 0.75,
                    fontWeight: "bold",
                    marginLeft: width * 0.02,
                  }}
                >
                  EDIT
                </Text>
              </TouchableOpacity>

              
              <TouchableOpacity
                onPress={onDelete}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#42475A",
                  paddingVertical: height * 0.006,
                  paddingHorizontal: width * 0.04,
                  marginBottom: height * 0.01,
                  borderRadius: 10,
                  marginLeft: width * 0.02,
                }}
              >
                <FontAwesome
                  name="trash"
                  size={fontSizeBase * 0.75}
                  color="white"
                />
                <Text
                  style={{
                    color: "white",
                    fontSize: fontSizeBase * 0.75,
                    fontWeight: "bold",
                    marginLeft: width * 0.02,
                  }}
                >
                  DELETE
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
                <Text
                  style={{ color: "#D1D5DB", fontSize: fontSizeBase * 0.8 }}
                >
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
                    name={getConfidenceIcon(
                      verified.VR_confidence_score * 100
                    )}
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

      
      <EditReportModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        reportData={verified || preverified}
        onSave={handleSave}
      />
    </View>
  );
};

export default ReportCard;