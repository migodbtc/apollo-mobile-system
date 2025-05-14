import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useImageUri } from "@/constants/contexts/ImageURIContext";

const { width, height } = Dimensions.get("window");

const PreviewPage = () => {
  const router = useRouter();
  const { videoUri, setVideoUri } = useVideoUri();
  const { imageUri, setImageUri } = useImageUri();

  const [videoKey, setVideoKey] = useState(0);
  const videoReference = useRef<Video>(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null);

  const hardResetVideo = async () => {
    try {
      if (videoReference.current) {
        await videoReference.current.pauseAsync();
        await videoReference.current.stopAsync();
        await videoReference.current.unloadAsync();
      }

      setVideoError(false);
      setIsVideoReady(false);
      setVideoStatus(null);

      setVideoKey((prev) => prev + 1);

      setVideoUri(null);
      setImageUri(null);
    } catch (error) {
      console.error("[hardResetVideo] ERROR during reset:", error);
      throw error;
    }
  };

  const hardResetVideoWithoutUri = async () => {
    try {
      if (videoReference.current) {
        await videoReference.current.pauseAsync();
        await videoReference.current.stopAsync();
        await videoReference.current.unloadAsync();
      }

      setVideoError(false);
      setIsVideoReady(false);
      setVideoStatus(null);

      setVideoKey((prev) => prev + 1);
    } catch (error) {
      console.error("[hardResetVideoWithoutUri] ERROR during reset:", error);
      throw error;
    }

    if (videoUri) {
      setTimeout(() => {
        videoReference.current?.playAsync().catch(console.error);
      }, 500);
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setVideoStatus(status);

    if (!status.isLoaded) {
      if (status.error) {
        console.error("Video playback error:", status.error);
        setVideoError(true);
      }
      return;
    }

    if (!isVideoReady) {
      setIsVideoReady(true);
    }
  };

  useEffect(() => {
    const loadVideo = async () => {
      if (!videoUri) return;

      try {
        setVideoError(false);
        setIsVideoReady(false);

        if (videoReference.current) {
          await videoReference.current.loadAsync(
            { uri: videoUri },
            { shouldPlay: true, isLooping: true },
            false
          );
        }
      } catch (error) {
        console.error("Video load error:", error);
        setVideoError(true);
      }
    };

    loadVideo();

    return () => {
      if (videoReference.current) {
        videoReference.current.unloadAsync().catch(console.error);
      }
    };
  }, [videoUri, videoKey]);

  const handleBack = async () => {
    try {
      await hardResetVideo();
      router.replace("/(dash)/(camera)/capture");
    } catch (error) {
      console.error("handleBack: Error during back navigation:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      await hardResetVideoWithoutUri();
      await router.replace("/(dash)/(camera)/submission");
    } catch (error) {
      console.error("handleSubmit: Error during submission:", error);
    }
  };

  const showLoading = !isVideoReady && !videoError && videoUri;

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={styles.header}>
        {videoUri ? (
          <Text style={[styles.actionCardTitle, { fontSize: width * 0.04 }]}>
            <FontAwesome name="video-camera" />
            {"  "}VIDEO PREVIEW
          </Text>
        ) : (
          <Text style={[styles.actionCardTitle, { fontSize: width * 0.04 }]}>
            <FontAwesome name="image" />
            {"  "}
            IMAGE PREVIEW
          </Text>
        )}
      </View>

      {videoUri ? (
        <View style={styles.videoContainer}>
          <Video
            key={`video-${videoKey}`}
            ref={videoReference}
            style={styles.video}
            source={{ uri: videoUri }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            isMuted={false}
            shouldPlay={true}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {showLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          )}

          {videoError && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.errorText}>Video playback failed</Text>
              <TouchableOpacity onPress={() => hardResetVideo()}>
                <Text style={styles.retryText}>Tap to reset</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      ) : (
        <Text style={styles.noMediaText}>No media available</Text>
      )}

      <View style={styles.actionCard}>
        <View style={styles.actionCardTextSection}>
          <Text style={styles.actionCardTitle}>
            Satisfied with the recording?
          </Text>
          <Text style={styles.actionCardSubtitle}>
            Review your media and decide whether to submit or to retake.
          </Text>
        </View>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleBack}>
            <Text style={styles.actionButtonText}>
              <FontAwesome
                name="arrow-left"
                size={width * 0.035}
                color="#11162B"
              />
              {"  "}
              BACK
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSubmit}>
            <Text style={styles.actionButtonText}>
              <FontAwesome
                name="check-circle"
                size={width * 0.035}
                color="#11162B"
              />
              {"  "}
              SUBMIT
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  video: {
    width: "90%",
    marginHorizontal: "5%",
    height: "90%",
  },
  imageContainer: {
    width: "90%",
    paddingBottom: height * 0.12,
    // borderStyle: "solid",
    // borderWidth: 1,
    // borderColor: "red",
    // borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noMediaText: {
    color: "white",
    fontSize: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 18,
    marginBottom: 10,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
  },
  retryText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionCard: {
    width: "90%",
    height: height * 0.225,
    backgroundColor: "#11162B",
    borderRadius: 24,
    overflow: "hidden",
    paddingBottom: 12,
    position: "absolute",
    bottom: 0,
    zIndex: 2,
  },
  actionCardTextSection: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "80%",
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
  },
  actionCardTitle: {
    width: "100%",
    color: "#f97316",
    fontSize: width * 0.045,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
  actionCardSubtitle: {
    color: "#94A3B8",
    fontSize: width * 0.03,
    textAlign: "center",
    marginTop: 8,
    width: "70%",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: width * 0.05,
  },
  actionButton: {
    backgroundColor: "#F97316",
    borderRadius: 10,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.02,
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
  },
  actionButtonText: {
    color: "#11162B",
    fontWeight: "bold",
    fontSize: width * 0.035,
    textAlign: "center",
  },
  header: {
    width: "100%",
    paddingVertical: 20,
    backgroundColor: "#11162B",
    overflow: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
  },
});

export default PreviewPage;
