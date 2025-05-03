import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

const LoadingScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#020617",
      }}
    >
      <FontAwesome name="rocket" size={32} color="#c2410c" />
      <Text style={{ color: "#c2410c", marginBottom: 10, fontSize: 16 }}>
        Apollo is loading...
      </Text>
      <ActivityIndicator size="large" color="#c2410c" />
    </View>
  );
};

export default LoadingScreen;
