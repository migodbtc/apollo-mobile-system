import {
  View,
  Text,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useSession } from "@/constants/contexts/SessionContext";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");
const IMG_ICON_SIZE = 24;

const UserProfileCard = () => {
  const { sessionData } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Function to pick the image for the profile
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required!",
          "Need photo library access to change profile picture"
        );
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        if (selectedAsset.uri) {
          setProfileImage(selectedAsset.uri);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // Function to reset the image picked
  const handleResetImage = () => {
    Alert.alert(
      "Reset Profile Image",
      "Are you sure you want to reset your profile image?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Reset",
          style: "destructive",
          onPress: () => setProfileImage(null),
        },
      ]
    );
  };

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
      case "admin":
        badgeStyle = {
          backgroundColor: "#EF4444", // RED
          color: "#FFFFFF",
        };
        badgeText = "Administrator";
        break;
      case "superadmin":
        badgeStyle = {
          backgroundColor: "#01B073", // TEAL
          color: "#FFFFFF",
        };
        badgeText = "⭐ Superadministrator";
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
          paddingHorizontal: 8,
          paddingVertical: 4,
          alignSelf: "flex-start",
          marginTop: 8,
        }}
      >
        <Text
          style={{
            color: badgeStyle.color,
            fontSize: width * 0.025,
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
        height: height * 0.25,
        backgroundColor: "#11162B",
        borderRadius: 20,
        marginBottom: 20,
        position: "relative",
      }}
    >
      {/* Left Half of User Card with Edit Icon integrated*/}
      <View
        style={{
          width: "50%",
          height: "100%",
          backgroundColor: "#020617",
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
        }}
      >
        {/* Functioning Edit Icon (BACKEND NOT YET IMPLEMENTED KASI HEHE)*/}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            width: "auto",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            zIndex: 1,
            borderWidth: 0,
            borderColor: "#F97316",
          }}
        >
          <FontAwesome
            name="pencil"
            size={IMG_ICON_SIZE}
            color="#F97316"
            style={{
              textShadowColor: "#020617",
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 3,
            }}
          />
        </TouchableOpacity>
        {profileImage && (
          <View
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              width: "80%",
              height: IMG_ICON_SIZE,
              zIndex: 1,
              flexDirection: "row",
            }}
          >
            {/* Save the submitted image into the database */}
            <TouchableOpacity>
              <FontAwesome
                name="save"
                size={IMG_ICON_SIZE}
                color="#F97316"
                style={{
                  textShadowColor: "#020617",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 3,
                  marginRight: 8,
                }}
              />
            </TouchableOpacity>
            {/* Reset the submitted image */}
            <TouchableOpacity onPress={handleResetImage}>
              <FontAwesome
                name="refresh"
                size={IMG_ICON_SIZE}
                color="#6c757d"
                style={{
                  textShadowColor: "#020617",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 3,
                  marginRight: 8,
                }}
              />
            </TouchableOpacity>
          </View>
        )}

        <ImageBackground
          source={
            profileImage
              ? { uri: profileImage }
              : require("../../assets/images/user_placeholder.png")
          }
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#020617",
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
          width: "50%",
          height: "100%",
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            color: "#fb923c",
            fontSize: width * 0.04,
            fontWeight: "bold",
          }}
        >
          {"@" + sessionData?.UA_username.toUpperCase() || "Name not found"}
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
            fontSize: width * 0.025,
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
