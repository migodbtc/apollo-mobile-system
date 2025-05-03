import { View, Text, Dimensions, ImageBackground } from "react-native";
import React from "react";
import { useSession } from "@/constants/contexts/SessionContext";

const { width, height } = Dimensions.get("window");

const UserProfileCard = () => {
  const { sessionData } = useSession();

  // Function to render role badge
  const renderRoleBadge = (role: string | undefined) => {
    let badgeStyle: { backgroundColor: string; color: string } = {
      backgroundColor: "",
      color: "",
    };
    let badgeText = "";

    switch (role) {
      case "civilian":
        badgeStyle = {
          backgroundColor: "#3B82F6", // BLUE
          color: "#FFFFFF",
        };
        badgeText = "Civilian";
        break;
      case "responder":
        badgeStyle = {
          backgroundColor: "#F59E0B", // AMBER
          color: "#FFFFFF",
        };
        badgeText = "Responder";
        break;
      case "sysad":
        badgeStyle = {
          backgroundColor: "#EF4444", // RED
          color: "#FFFFFF",
        };
        badgeText = "System Administrator";
        break;
      default:
        badgeStyle = {
          backgroundColor: "#6B7280", // GRAY
          color: "#FFFFFF",
        };
        badgeText = "Unknown Role";
        break;
    }

    return (
      <View
        style={{
          backgroundColor: badgeStyle.backgroundColor,
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: "flex-start",
          marginTop: 8,
        }}
      >
        <Text
          style={{
            color: badgeStyle.color,
            fontSize: width * 0.03,
            fontWeight: "bold",
          }}
        >
          {badgeText}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        width: "100%",
        height: height * 0.2,
        backgroundColor: "#11162B",
        borderRadius: 20,
        marginBottom: 20,
      }}
    >
      {/* Left Half of User Card */}
      <View
        style={{
          width: "40%",
          height: "100%",
          backgroundColor: "#020617",
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        }}
      >
        <ImageBackground
          source={require("../../assets/images/user_placeholder.png")}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "red",
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            overflow: "hidden",
          }}
        ></ImageBackground>
      </View>
      {/* Right Half of User Card */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          width: "60%",
          height: "100%",
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            color: "#fb923c",
            fontSize: width * 0.045,
            fontWeight: "bold",
          }}
        >
          {sessionData?.UA_username.toUpperCase() || "Name not found"}
        </Text>
        <Text
          style={{
            color: "#B0B3C4",
            fontSize: width * 0.03,
            paddingTop: 8,
          }}
        >
          {sessionData?.UA_email_address || "E-mail address not found..."}
        </Text>
        {renderRoleBadge(sessionData?.UA_user_role)}
        <Text
          style={{
            color: "#B0B3C4",
            fontSize: width * 0.03,
            paddingTop: 4,
          }}
        >
          Created on: {sessionData?.UA_created_at || "..."}
        </Text>
      </View>
    </View>
  );
};

export default UserProfileCard;
