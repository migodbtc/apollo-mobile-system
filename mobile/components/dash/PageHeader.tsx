import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { NavigationBarProps } from "@/constants/interfaces/components";
import { useSession } from "@/constants/contexts/SessionContext";

const { width, height } = Dimensions.get("window");

// Function to render the dynamic page title and icon
const renderHeaderContent: React.FC<NavigationBarProps> = ({
  selectedPanel,
}) => {
  const iconSize = width * 0.045;
  const textStyle = {
    color: "#646A85",
    fontSize: iconSize,
  };

  switch (selectedPanel) {
    case "home":
      return (
        <Text style={textStyle}>
          <FontAwesome name="home" size={iconSize} /> Home
        </Text>
      );
    case "map":
      return (
        <Text style={textStyle}>
          <FontAwesome name="map" size={iconSize} /> Map
        </Text>
      );
    case "reports":
      return (
        <Text style={textStyle}>
          <FontAwesome name="pie-chart" size={iconSize} /> Reports
        </Text>
      );
    case "about":
      return (
        <Text style={textStyle}>
          <FontAwesome name="info" size={iconSize} /> About
        </Text>
      );
    case "history":
      return (
        <Text style={textStyle}>
          <FontAwesome name="history" size={iconSize} /> History
        </Text>
      );
    case "team":
      return (
        <Text style={textStyle}>
          <FontAwesome name="users" size={iconSize} /> Teams
        </Text>
      );
    default:
      return null;
  }
};

const PageHeader: React.FC<NavigationBarProps> = ({
  selectedPanel,
  setSelectedPanel,
}) => {
  const { sessionData, setSessionData } = useSession();

  const handleLogout = () => {
    setSessionData(null);
  };

  return (
    <View
      style={{
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.025,
        backgroundColor: "#020617",
        height: height * 0.15,
        justifyContent: "space-between",
      }}
    >
      {/* App Title */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",

          marginBottom: height * 0.02,
        }}
      >
        <Text
          style={{
            width: "80%",
            fontSize: width * 0.06,
            fontWeight: "bold",
            color: "#c2410c",
          }}
        >
          <FontAwesome name="fire" size={width * 0.045} /> APOLLO
        </Text>
        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flex: 1,
            marginLeft: width * 0.03,
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ width: "100%", textAlign: "center" }}>
            <FontAwesome name="sign-out" size={width * 0.06} color="#c2410c" />
          </Text>
        </TouchableOpacity>
      </View>

      {/* Panel Title & User Info */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Left Side: Page Title */}
        <View style={{ justifyContent: "center", width: width * 0.45 }}>
          {renderHeaderContent({
            selectedPanel,
            setSelectedPanel,
          })}
        </View>

        {/* Right Side: User Info & Logout */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: "#42475A",
              fontSize: width * 0.03,
              fontWeight: "bold",
              fontStyle: "italic",
            }}
          >
            Logged in as @{sessionData?.UA_username}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PageHeader;
