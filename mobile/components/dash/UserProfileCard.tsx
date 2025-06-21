import { View, Text, Dimensions, ImageBackground, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { useSession } from "@/constants/contexts/SessionContext";
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

const UserProfileCard = () => {
  const { sessionData } = useSession();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    try {

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required', 'Need photo library access to change profile picture');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, //DI KO ALAM BAKIT DEPRACATED TO PERO NAGANA NAMAN EH NAKAKAPAG PICK NAMAN AKO NG PICS SA GALLERY EH 
        allowsEditing: true,
        aspect: [4, 3], 
        quality: 0.8, 
      });
  
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        if (selectedAsset.uri) {
          setProfileImage(selectedAsset.uri);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
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
        position: "relative",
      }}
    >
      {/* Left Half of User Card with Edit Icon integrated*/}
      <View
        style={{
          width: "40%",
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
          position: 'absolute',
          top: 5,
          right: 5,
          width: 35,
          backgroundColor: '#0000',
          
          borderRadius: 20,
          paddingLeft: 9,
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: 1,
          borderWidth: 0,
          borderColor: '#F97316',
        }}
      >
        <FontAwesome name="pencil" size={18} color="#F97316" />
      </TouchableOpacity>
        <ImageBackground
          source={profileImage ? { uri: profileImage } : require("../../assets/images/user_placeholder.png")}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#020617",
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
            overflow: "hidden",
          }}
        >        
        </ImageBackground>
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
