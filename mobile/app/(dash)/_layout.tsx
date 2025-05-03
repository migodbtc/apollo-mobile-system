import NavigationBar from "@/components/dash/NavigationBar";
import { Stack } from "expo-router";
import { useState } from "react";
import { View, Text } from "react-native";

export default function DashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationDuration: 1000,
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{ title: "Dashboard", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="(camera)"
        options={{ title: "Camera", animation: "slide_from_right" }}
      />
    </Stack>
  );
}
