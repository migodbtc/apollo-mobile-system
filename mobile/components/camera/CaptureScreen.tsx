import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import CameraPanel from "../panels/CameraPanel";
import { useRouter } from "expo-router";
import { CameraType, CameraView, Camera } from "expo-camera";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import { useImageUri } from "@/constants/contexts/ImageURIContext";
import * as FileSystem from "expo-file-system";

// DEVELOPER NOTE: There is a development issue with this script as it
// has the same functionality as the route ts file under the app directory
// but this is technically a legacy code, so that means code reallocation
// is needed for the 'capture' route.

const { width } = Dimensions.get("window");
const ASPECT_RATIO = 16 / 9; // Width to height ratio

const CameraScreen = () => {
  const router = useRouter();
  const cameraViewReference = useRef<CameraView | null>(null);
  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>(
    undefined
  );
  const { videoUri, setVideoUri } = useVideoUri();
  const { setImageUri } = useImageUri();

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    // Request microphone permission proactively so recording doesn't fail
    // on some devices where it isn't implicitly requested.
    const reqPerms = async () => {
      await ensurePermissionsAsync();
    };
    reqPerms();
  }, []);

  // Ensure permissions helper with multiple fallbacks for expo-camera versions
  const ensurePermissionsAsync = async () => {
    try {
      // Microphone
      if (Camera && (Camera as any).requestMicrophonePermissionsAsync) {
        const mic = await (Camera as any).requestMicrophonePermissionsAsync();
        setHasMicPermission(mic.status === "granted");
      } else if ((Camera as any).getMicrophonePermissionsAsync) {
        const mic = await (Camera as any).getMicrophonePermissionsAsync();
        setHasMicPermission(mic.status === "granted");
      } else {
        // best-effort fallback
        setHasMicPermission(false);
      }

      // Camera
      if (Camera && (Camera as any).requestCameraPermissionsAsync) {
        const cam = await (Camera as any).requestCameraPermissionsAsync();
        setHasCameraPermission(cam.status === "granted");
      } else if ((Camera as any).requestPermissionsAsync) {
        // older fallback
        const cam = await (Camera as any).requestPermissionsAsync();
        setHasCameraPermission(cam.status === "granted");
      } else if ((Camera as any).getPermissionsAsync) {
        const cam = await (Camera as any).getPermissionsAsync();
        setHasCameraPermission(cam.status === "granted");
      } else {
        // best-effort fallback
        setHasCameraPermission(false);
      }
    } catch (e) {
      setHasCameraPermission(false);
      setHasMicPermission(false);
    }
  };

  // If permissions are revoked while recording, stop recording immediately
  useEffect(() => {
    if (
      (hasCameraPermission === false || hasMicPermission === false) &&
      isRecording
    ) {
      handleStopRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCameraPermission, hasMicPermission]);

  const [facing, setFacing] = useState<CameraType>("back");
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationIntervalRef = useRef<number | null>(null);

  const toggleMediaType = () => {
    setIsVideoMode((prev) => !prev);
    if (isRecording) handleStopRecording();
  };

  // NOTE: metadata fetching via a Video ref is fragile across different preview
  // implementations. We simply set the video URI and proceed to the preview
  // screen; preview handlers (PreviewPanel) can load duration if needed.

  const handleStartRecording = async () => {
    // Prevent starting when we don't know or don't have permissions
    if (hasCameraPermission === null || hasMicPermission === null) {
      await ensurePermissionsAsync();
    }

    // log if cannot record
    console.log("Recording requested; camera permission:", hasCameraPermission);
    console.log("Recording requested; mic permission:", hasMicPermission);

    if (!hasCameraPermission || !hasMicPermission) {
      console.warn(
        "Camera or microphone permission not granted. Cannot record."
      );
      return;
    }

    if (!cameraViewReference.current) return;
    try {
      setVideoUri(null);
      setRecordingDuration(0);
      setIsRecording(true);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      const video = await (cameraViewReference.current as any).recordAsync({
        maxDuration: 30,
      });

      if (video?.uri) {
        // Persist uri to context and navigate to preview. File size can be
        // derived if needed by preview or submission flow.
        setVideoUri(video.uri);
        try {
          const fileInfo = await FileSystem.getInfoAsync(video.uri);
          setVideoSource({ uri: video.uri });
        } catch (e) {
          // ignore file info errors; preview will still attempt to play
        }
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
      await (cameraViewReference.current as any).stopRecording();
    } catch (err) {
    } finally {
      setIsRecording(false);
      if (durationIntervalRef.current)
        clearInterval(durationIntervalRef.current);
    }
  };

  const handleTakePhoto = async () => {
    if (!cameraViewReference.current) return;
    try {
      const photo = await (
        cameraViewReference.current as any
      ).takePictureAsync();
      if (photo?.uri) {
        setImageUri(photo.uri);
        router.push("/(dash)/(camera)/preview");
      }
    } catch (err) {
      console.error("take photo error", err);
    }
  };

  // Simple UI gating while permissions are being resolved or denied
  if (hasCameraPermission === null || hasMicPermission === null) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: "black" }]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "white", marginTop: 12 }}>
          Checking camera & mic permissions...
        </Text>
      </View>
    );
  }

  if (!hasCameraPermission || !hasMicPermission) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: "black", padding: 20 },
        ]}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Camera and microphone permissions are required to record video. Please
          enable them in system settings and reopen the app.
        </Text>
      </View>
    );
  }

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
        facing={facing}
        setFacing={setFacing}
        isRecording={isRecording}
        isVideoMode={isVideoMode}
        toggleMediaType={toggleMediaType}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        recordingDuration={recordingDuration}
        handleGoBack={() => router.push("/(dash)/dashboard")}
        handleTakePhoto={handleTakePhoto}
        captureFeedback={null}
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
