import { View, Text, ActivityIndicator, Dimensions } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

const LoadingMapPanel = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#020617",
      }}
    >
      <FontAwesome name="map" size={width * 0.08} color="#c2410c" />
      <Text
        style={{
          color: "#c2410c",
          marginTop: height * 0.03,
          fontSize: 16,
        }}
      >
        Initializing map. This may take a while!
      </Text>
      <Text
        style={{
          marginBottom: height * 0.025,
          color: "#646A85",
          fontStyle: "italic",
          textAlign: "center",
        }}
      >
        The map won't load if location {"\n"} permissions are disabled.
      </Text>
      <ActivityIndicator size="large" color="#c2410c" />
    </View>
  );
};

export default LoadingMapPanel;
