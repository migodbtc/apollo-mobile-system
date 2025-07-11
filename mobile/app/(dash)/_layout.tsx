import NavigationBar from "@/components/dash/NavigationBar";
import { Stack } from "expo-router";
import { useState } from "react";
import { View, Text, SafeAreaView } from "react-native";

export default function DashboardLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animationDuration: 1000,
          animation: "fade",
        }}
      >
        <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
        <Stack.Screen name="(camera)" options={{ title: "Camera" }} />
      </Stack>
    </SafeAreaView>
  );
}
