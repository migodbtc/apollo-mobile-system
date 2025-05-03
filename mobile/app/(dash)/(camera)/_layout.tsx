import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { VideoUriProvider } from "@/constants/contexts/VideoURIContext";

const _layout = () => {
  return (
    <VideoUriProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animationDuration: 1000,
        }}
      >
        <Stack.Screen
          name="capture"
          options={{ title: "Capture", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="preview"
          options={{ title: "Preview", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="submission"
          options={{ title: "Submission", animation: "slide_from_right" }}
        />
      </Stack>
    </VideoUriProvider>
  );
};

export default _layout;
