import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useVideoPlayer, VideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useImageUri } from "@/constants/contexts/ImageURIContext";

const { width, height } = Dimensions.get("window");

const PreviewPage = () => {
  const router = useRouter();
  const { videoUri, setVideoUri } = useVideoUri();
  const { imageUri, setImageUri } = useImageUri();
  const player = useVideoPlayer(videoUri ?? "", (player) => {
    player.loop = true;
  });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const [showPreview, setShowPreview] = useState(false);
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);
  const lastUriRef = useRef<string | null>(null);

  // ONPRESS HANDLERS
  const handleBack = () => {
    setVideoUri(null);
    setImageUri(null);
    router.replace("/(dash)/(camera)/capture");
  };

  const handleSubmit = () => {
    router.replace("/(dash)/(camera)/submission");
  };

  // EFFECT HOOKS
  useEffect(() => {
    if (!videoUri || !player) return;

    player.replay();
    player.play();
  }, [videoUri, player]);

  useEffect(() => {
    const currentUri = videoUri || imageUri || null;
    if (lastUriRef.current === currentUri) {
      return;
    }
    lastUriRef.current = currentUri;

    setShowPreview(false);
    setMinLoadingTimePassed(false);

    if (!currentUri) {
      setShowPreview(true);
      return;
    }

    const minTimer = setTimeout(() => {
      setMinLoadingTimePassed(true);
    }, 800);

    return () => clearTimeout(minTimer);
  }, [videoUri, imageUri]);

  useEffect(() => {
    if (!minLoadingTimePassed) return;

    const currentUri = videoUri || imageUri;
    if (!currentUri) return;

    if (videoUri) {
      if (player) {
        setShowPreview(true);
      }
    } else {
      setShowPreview(true);
    }
  }, [minLoadingTimePassed, videoUri, imageUri, player]);

  // HELPER COMPONENT
  const MediaPreview = ({
    videoUri,
    imageUri,
    player,
  }: {
    videoUri: string | null;
    imageUri: string | null;
    player: VideoPlayer;
  }) => {
    if (videoUri) {
      return (
        <View style={styles.mediaContainer}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>
      );
    }
    if (imageUri) {
      return (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      );
    }
    return (
      <View style={styles.mediaContainer}>
        <Text style={styles.noMediaText}>No media available</Text>
      </View>
    );
  };

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

      {showPreview ? (
        <MediaPreview videoUri={videoUri} imageUri={imageUri} player={player} />
      ) : (
        <View style={styles.mediaContainer}>
          <Text style={styles.loadingText}>Loading preview...</Text>
        </View>
      )}
      <View style={styles.actionCard}>
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonBack]}
            onPress={handleBack}
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
  },
  mediaContainer: {
    width: "100%",
    aspectRatio: 9 / 16,
    backgroundColor: "#18181b",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.03,
    alignSelf: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  video: {
    width: "100%",
    height: "100%",
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
    width: "100%",
    height: "auto",
    backgroundColor: "transparent",
    overflow: "hidden",
    paddingVertical: height * 0.02,
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
    width: "80%",
    color: "#f97316",
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 8,
    marginLeft: width * 0.05,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
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
    borderRadius: 12,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.02,
    justifyContent: "center",
    alignItems: "center",
    width: "30%",
  },
  actionButtonBack: {
    backgroundColor: "#42475A",
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
    backgroundColor: "transparent",
    overflow: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 2,
  },
});

export default PreviewPage;
