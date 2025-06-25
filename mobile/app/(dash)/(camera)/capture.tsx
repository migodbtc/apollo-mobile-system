import { Dimensions, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { CameraType, CameraView } from "expo-camera";
import { useRouter } from "expo-router";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import CameraPanel from "@/components/panels/CameraPanel";
import { useImageUri } from "@/constants/contexts/ImageURIContext";

const { height } = Dimensions.get("window");

// LAST PROBLEM: The videos prerecorded and saved within the app
// do not properly get cleared and sometimes overlays with other videos

const CaptureScreen = () => {
  const router = useRouter();
  const cameraViewReference = useRef<CameraView | null>(null);
  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>(
    undefined
  );
  const { videoUri, setVideoUri } = useVideoUri();
  const { imageUri, setImageUri } = useImageUri();

  const [facing, setFacing] = useState<CameraType>("back");
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [captureFeedback, setCaptureFeedback] = useState<
    null | "photo" | "video"
  >(null);
  const durationIntervalRef = useRef<number | null>(null);

  const toggleMediaType = () => {
    if (isRecording) handleStopRecording();
    setIsVideoMode((prev) => !prev);
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

        router.replace("/(dash)/(camera)/preview");
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
      setCaptureFeedback("video");
      setTimeout(() => {
        setCaptureFeedback(null);
        setImageUri(null);
        setIsRecording(false);
        if (durationIntervalRef.current)
          clearInterval(durationIntervalRef.current);
        router.replace("/(dash)/(camera)/preview");
      }, 1000);
    } catch (err) {
      console.warn(err);
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
      setCaptureFeedback("photo");
      setTimeout(() => {
        setCaptureFeedback(null);
        router.replace("/(dash)/(camera)/preview");
      }, 1000);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleReturn = () => {
    setVideoUri(null);
    setImageUri(null);
    router.replace("/dashboard");
  };

  useEffect(() => {
    if (!videoUri) setVideoSource(undefined);
  }, [videoUri]);

  return (
    <View style={{ flex: 1, backgroundColor: "#020617", height }}>
      <CameraPanel
        cameraRef={cameraViewReference}
        facing={facing}
        setFacing={setFacing}
        isRecording={isRecording}
        isVideoMode={isVideoMode}
        toggleMediaType={toggleMediaType}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        recordingDuration={recordingDuration}
        handleGoBack={handleReturn}
        handleTakePhoto={handleTakePhoto}
        captureFeedback={captureFeedback}
      />
    </View>
  );
};

export default CaptureScreen;

const styles = StyleSheet.create({});
