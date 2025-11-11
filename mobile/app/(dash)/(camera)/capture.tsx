import { Dimensions, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraType, CameraView } from "expo-camera";
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
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<
    boolean | null
  >(null);
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

  // Request camera & microphone permissions on mount and keep local state
  useEffect(() => {
    let mounted = true;

    const getPermissions = async () => {
      try {
        const camPerm = await Camera.requestCameraPermissionsAsync();
        // Some SDK versions expose a microphone permission helper on Camera;
        // if not available, try to gracefully assume it's handled elsewhere.
        let micPerm: { status?: string } = { status: "granted" };

        if (typeof Camera.requestMicrophonePermissionsAsync === "function") {
          // @ts-ignore - optional helper may not exist on all SDKs
          micPerm = await Camera.requestMicrophonePermissionsAsync();
        }

        if (!mounted) return;

        setHasCameraPermission(camPerm.status === "granted");
        setHasMicrophonePermission(micPerm.status === "granted");
      } catch (err) {
        console.warn("Permission request failed:", err);
        if (!mounted) return;
        setHasCameraPermission(false);
        setHasMicrophonePermission(false);
      }
    };

    getPermissions();

    return () => {
      mounted = false;
    };
  }, []);

  const handleStartRecording = async () => {
    console.log("Start recording requested");
    // Ensure we have camera and microphone permissions before starting.
    if (hasCameraPermission !== true || hasMicrophonePermission !== true) {
      try {
        const cam = await Camera.requestCameraPermissionsAsync();
        // @ts-ignore optional API
        const mic =
          typeof Camera.requestMicrophonePermissionsAsync === "function"
            ? await Camera.requestMicrophonePermissionsAsync()
            : { status: "granted" };

        setHasCameraPermission(cam.status === "granted");
        setHasMicrophonePermission(mic.status === "granted");

        if (cam.status !== "granted" || mic.status !== "granted") {
          console.warn(
            "Camera or microphone permission not granted. Aborting recording."
          );
          return;
        }
      } catch (err) {
        console.warn("Permission request failed:", err);
        return;
      }
    }

    if (!cameraViewReference.current) return;
    try {
      setVideoUri(null);

      setRecordingDuration(0);
      setIsRecording(true);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      const video = await cameraViewReference.current.recordAsync({
        maxDuration: 5,
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
