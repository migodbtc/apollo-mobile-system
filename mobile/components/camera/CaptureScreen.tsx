import React, { useState, useEffect, useRef } from "react";
import { View, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import CameraPanel from "./CameraPanel";
import { useRouter } from "expo-router";
import { CameraType, CameraView } from "expo-camera";
import { Video } from "expo-av";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import { VideoMetadata } from "@/constants/interfaces/media";
import * as FileSystem from "expo-file-system";

// DEVELOPER NOTE: There is a development issue with this script as it
// has the same functionality as the route ts file under the app directory
// but this is technically a legacy code, so that means code reallocation
// is needed for the 'capture' route.

const { width } = Dimensions.get("window");
const ASPECT_RATIO = 16 / 9; // Width to height ratio

const CameraScreen = () => {
  const router = useRouter();
  const cameraViewReference = useRef<CameraView>(null);
  const videoReference = useRef<Video>(null);
  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>(
    undefined
  );
  const { videoUri, setVideoUri } = useVideoUri();

  const [facing, setFacing] = useState<CameraType>("back");
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMediaType = () => {
    setIsVideoMode((prev) => !prev);
    if (isRecording) handleStopRecording();
  };

  const getVideoMetadata = async (uri: string): Promise<VideoMetadata> => {
    return new Promise(async (resolve, reject) => {
      let intervalId: NodeJS.Timeout | null = null;
      let timeoutId: NodeJS.Timeout | null = null;
      const MAX_RETRIES = 30;
      let retryCount = 0;

      try {
        setVideoUri(uri);
        setVideoSource({ uri });

        intervalId = setInterval(async () => {
          retryCount++;
          const ref = videoReference.current;

          if (!ref) {
            if (retryCount >= MAX_RETRIES) {
              clearInterval(intervalId!);
              reject(new Error("Video reference not available"));
            }
            return;
          }

          try {
            const status = await ref.getStatusAsync();

            if (status.isLoaded && status.durationMillis !== undefined) {
              clearInterval(intervalId!);
              if (timeoutId) clearTimeout(timeoutId);

              const fileInfo = await FileSystem.getInfoAsync(uri);

              resolve({
                duration: status.durationMillis / 1000,
                size: fileInfo.exists ? fileInfo.size : null,
                uri,
              });
            } else if (retryCount >= MAX_RETRIES) {
              clearInterval(intervalId!);
              reject(new Error("Video never loaded"));
            }
          } catch (error) {
            clearInterval(intervalId!);
            reject(error);
          }
        }, 100);

        timeoutId = setTimeout(() => {
          clearInterval(intervalId!);
          reject(new Error("Timeout: Video metadata fetch took too long"));
        }, 5000);
      } catch (err) {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        reject(err);
      }
    });
  };

  const handleStartRecording = async () => {
    if (!cameraViewReference.current) return;
    try {
      setVideoUri(null);
      setRecordingDuration(0);
      setIsRecording(true);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      const video = await cameraViewReference.current.recordAsync({
        maxDuration: 30,
      });

      if (video?.uri) {
        setVideoUri(video.uri);

        const metadata = await getVideoMetadata(video.uri);
        router.push("/(dash)/(camera)/preview");
      }
    } catch (err) {
      setIsRecording(false);
      if (durationIntervalRef.current)
        clearInterval(durationIntervalRef.current);
    }
  };

  const handleStopRecording = async () => {
    if (!cameraViewReference.current || !isRecording) return;
    try {
      await cameraViewReference.current.stopRecording();
    } catch (err) {
    } finally {
      setIsRecording(false);
      if (durationIntervalRef.current)
        clearInterval(durationIntervalRef.current);
    }
  };

  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "black",
      }}
    >
      <CameraPanel
        cameraRef={cameraViewReference}
        videoRef={videoReference}
        facing={facing}
        setFacing={setFacing}
        isRecording={isRecording}
        isVideoMode={isVideoMode}
        toggleMediaType={toggleMediaType}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        recordingDuration={recordingDuration}
        handleGoBack={() => router.push("/dashboard")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CameraScreen;
