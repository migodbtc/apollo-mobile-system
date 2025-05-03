import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { Video, AVPlaybackStatus, ResizeMode } from "expo-av";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

// LAST PROBLEM: The videos prerecorded and saved within the app
// do not properly get cleared and sometimes overlays with other videos

const PreviewPage = () => {
  const router = useRouter();
  const { videoUri, setVideoUri } = useVideoUri();
  const videoReference = useRef<Video>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoStatus, setVideoStatus] = useState<AVPlaybackStatus | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (videoUri && videoReference.current) {
        try {
          await videoReference.current.loadAsync(
            { uri: videoUri },
            { shouldPlay: true },
            false
          );
        } catch (error) {
          console.error("Video load error:", error);
          setVideoError(true);
        }
      }
    };

    loadVideo();

    return () => {
      const cleanup = async () => {
        try {
          if (videoReference.current) {
            await videoReference.current.stopAsync();
            await videoReference.current.unloadAsync();
          }
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      };
      cleanup();
    };
  }, [videoUri]);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setVideoStatus(status);

    if (!status.isLoaded) {
      if ("error" in status) {
        console.error("Playback error:", status.error);
        setVideoError(true);
      }
      return;
    }

    if (status.didJustFinish) {
      if (videoReference.current && !status.isPlaying) {
        videoReference.current.replayAsync();
      }
    }
  };

  const retryPlayback = async () => {
    setVideoError(false);
    if (videoUri && videoReference.current) {
      try {
        await videoReference.current.replayAsync();
      } catch (error) {
        console.error("Retry failed:", error);
        setVideoError(true);
      }
    }
  };

  return (
    <>
      <View style={[styles.container, { width, height }]}>
        {videoUri ? (
          <View style={styles.videoContainer}>
            <Video
              ref={videoReference}
              style={styles.video}
              source={{ uri: videoUri }}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              isMuted={false}
              shouldPlay
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />

            {videoError && (
              <View style={styles.errorOverlay}>
                <Text style={styles.errorText}>Video playback failed</Text>
                <Text style={styles.retryText} onPress={retryPlayback}>
                  Tap to retry
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noVideoText}>No video available</Text>
        )}

        <View style={styles.actionCard}>
          <View style={styles.actionCardTextSection}>
            <Text style={styles.actionCardTitle}>Media Preview</Text>
            <Text style={styles.actionCardSubtitle}>
              Review your media and decide whether to submit or to retake.
            </Text>
          </View>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={async () => {
                try {
                  if (videoReference.current) {
                    await videoReference.current.stopAsync();
                    await videoReference.current.unloadAsync();
                  }
                  setVideoUri(null);
                  setVideoError(false);
                  setVideoStatus(null);
                } catch (error) {
                  console.error("Navigation cleanup error:", error);
                } finally {
                  router.push("/(dash)/(camera)/capture");
                }
              }}
            >
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
            <TouchableOpacity
              style={styles.actionButton}
              onPress={async () => {
                try {
                  if (videoReference.current) {
                    await videoReference.current.pauseAsync();
                  }
                  setVideoError(false);
                } catch (error) {
                  console.error("Submit preparation error:", error);
                } finally {
                  router.push("/(dash)/(camera)/submission");
                }
              }}
            >
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    zIndex: 1,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  noVideoText: {
    color: "white",
    fontSize: 18,
  },
  errorOverlay: {
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
    fontSize: width * 0.06,
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
    width: "100%",
    height: "30%",
    paddingBottom: 12,
    gap: width * 0.02,
    paddingHorizontal: width * 0.06,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "40%",
    borderRadius: 12,
    backgroundColor: "#f97316",
    marginHorizontal: width * 0.01,
    paddingVertical: height * 0.01,
  },
  actionButtonText: {
    fontWeight: "bold",
    fontSize: width * 0.035,
    color: "#11162B",
  },
});

export default PreviewPage;
