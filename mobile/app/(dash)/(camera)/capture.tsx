import { Dimensions, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { CameraType, CameraView } from "expo-camera";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import CameraPanel from "@/components/camera/CameraPanel";
import { VideoMetadata } from "@/constants/interfaces/media";
import { useImageUri } from "@/constants/contexts/ImageURIContext";

const { height } = Dimensions.get("window");

// LAST PROBLEM: The videos prerecorded and saved within the app
// do not properly get cleared and sometimes overlays with other videos

const CaptureScreen = () => {
  const router = useRouter();
  const cameraViewReference = useRef<CameraView>(null);
  const videoReference = useRef<Video>(null);
  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>(
    undefined
  );
  const { videoUri, setVideoUri } = useVideoUri();
  const { imageUri, setImageUri } = useImageUri();

  const [facing, setFacing] = useState<CameraType>("back");
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMediaType = () => {
    if (isRecording) handleStopRecording();
    setIsVideoMode((prev) => !prev);
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
      if (videoReference.current) {
        await videoReference.current.unloadAsync();
      }

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
      setImageUri(null);
      setIsRecording(false);
      if (durationIntervalRef.current)
        clearInterval(durationIntervalRef.current);
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraViewReference.current) {
      console.warn("Camera ref is not available");
      return;
    }

    try {
      const photo = await cameraViewReference.current.takePictureAsync({
        quality: 1,
      });

      if (!photo?.uri) {
        throw new Error("Photo capture failed - no URI returned");
      }

      setVideoUri(null);
      setImageUri(photo.uri);

      router.push("/(dash)/(camera)/preview");
    } catch (err) {
      console.error("Failed to take photo", err);
    }
  };

  useEffect(() => {
    if (!videoUri) setVideoSource(undefined);
  }, [videoUri]);

  return (
    <View style={{ flex: 1, backgroundColor: "#020617", height }}>
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
        handleGoBack={() => {
          setVideoUri(null);
          setImageUri(null);
          router.push("/dashboard");
        }}
        handleTakePhoto={handleTakePhoto}
      />
      {videoSource && (
        <Video
          ref={videoReference}
          source={videoSource}
          style={{ width: 0, height: 0 }}
          useNativeControls={false}
          isMuted
          shouldPlay={false}
        />
      )}
    </View>
  );
};

export default CaptureScreen;

const styles = StyleSheet.create({});
