import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { VideoUriProvider } from "@/constants/contexts/VideoURIContext";
import { ImageUriProvider } from "@/constants/contexts/ImageURIContext";

const _layout = () => {
  return (
    <VideoUriProvider>
      <ImageUriProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animationDuration: 1000,
          }}
        >
          <Stack.Screen
            name="capture"
            options={{ title: "Capture", animation: "fade" }}
          />
          <Stack.Screen
            name="preview"
            options={{ title: "Preview", animation: "fade" }}
          />
          <Stack.Screen
            name="submission"
            options={{ title: "Submission", animation: "fade" }}
          />
        </Stack>
      </ImageUriProvider>
    </VideoUriProvider>
  );
};

export default _layout;
