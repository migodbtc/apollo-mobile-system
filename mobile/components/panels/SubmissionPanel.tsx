import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useVideoUri } from "@/constants/contexts/VideoURIContext";
import { VideoMetadata } from "@/constants/interfaces/media";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { useSession } from "@/constants/contexts/SessionContext";
import SERVER_LINK from "@/constants/netvar";
import axios from "axios";
import { useImageUri } from "@/constants/contexts/ImageURIContext";
import { SubmissionPanelProps } from "@/constants/interfaces/components";

const { width, height } = Dimensions.get("window");

const SubmissionPanel: React.FC<SubmissionPanelProps> = ({
  isLoading,
  isSubmissionSending,
  isSubmissionSuccessVisible,
  setIsLoading,
  setIsSubmissionSending,
  setIsSubmissionSuccessVisible,
  getFullName,
  formatAddress,
  address,
  coords,
  timestamp,
  setAddress,
  setCoords,
  setTimestamp,
  onBackPress,
  onSubmitPress,
  onCloseSuccessModal,
}) => {
  const router = useRouter();
  const { sessionData, setSessionData } = useSession();
  const videoReference = useRef<Video>(null);
  const { videoUri } = useVideoUri();
  const { imageUri } = useImageUri();
  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>(
    undefined
  );

  const [vidMetaData, setVidMetaData] = useState<VideoMetadata | null>(null);
  const [imageMetaData, setImageMetaData] = useState<{ size?: number } | null>(
    null
  );

  const getVideoMetadata = async (uri: string): Promise<VideoMetadata> => {
    return new Promise(async (resolve, reject) => {
      let intervalId: NodeJS.Timeout | null = null;
      let timeoutId: NodeJS.Timeout | null = null;
      const MAX_RETRIES = 30;
      let retryCount = 0;

      try {
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

  const sendReportToAPI = async () => {
    if (isLoading || !coords || !sessionData?.UA_user_id) return;

    try {
      // Base report payload (common for both video and image)
      const reportPayload: any = {
        reporter: { id: sessionData.UA_user_id },
        location: {
          coordinates: coords,
          address: address ? formatAddress(address) : "Unknown location",
        },
        timestamp: timestamp,
      };

      const formData = new FormData();

      if (videoUri) {
        if (!vidMetaData?.uri) throw new Error("Video URI is missing");

        reportPayload.media = {
          size: vidMetaData.size,
          duration: vidMetaData.duration,
        };

        formData.append("report", JSON.stringify(reportPayload));
        formData.append("video", {
          uri: vidMetaData.uri,
          type: "video/mp4",
          name: `report_${Date.now()}.mp4`,
        } as any);

        const uploadResponse = await axios.post(
          `${SERVER_LINK}/reports/upload/video`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${sessionData.UA_user_id}`,
            },
          }
        );

        if (uploadResponse.status !== 200) {
          throw new Error(uploadResponse.data.message || "Video upload failed");
        }
      } else if (imageUri) {
        if (!imageMetaData) throw new Error("Image metadata missing");

        reportPayload.media = {
          size: imageMetaData.size,
        };

        formData.append("report", JSON.stringify(reportPayload));
        formData.append("image", {
          uri: imageUri,
          type: "image/jpeg",
          name: `report_${Date.now()}.jpg`,
        } as any);

        const uploadResponse = await axios.post(
          `${SERVER_LINK}/reports/upload/image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${sessionData.UA_user_id}`,
            },
          }
        );

        if (uploadResponse.status !== 200) {
          throw new Error(uploadResponse.data.message || "Image upload failed");
        }
      } else {
        throw new Error("No media provided for upload");
      }

      setIsSubmissionSuccessVisible(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmissionSending(false);
    }
  };

  const handleSubmitButton = () => {
    setIsSubmissionSending(true);
    sendReportToAPI();
  };

  // FETCH LOCATION AND ADDRESS
  useEffect(() => {
    const fetchLocationAndAddress = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          setCoords({ latitude, longitude });

          const result = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          setAddress(result[0] || null);
        }
      } catch (error) {
        console.error("Location error:", error);
      }
    };

    fetchLocationAndAddress();
  }, []);

  // REVERSE GEOCODING
  useEffect(() => {
    if (coords) {
      const reverseGeocode = async () => {
        try {
          const result = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          if (result.length > 0) {
            setAddress(result[0]);
          } else {
            setAddress(null);
          }
        } catch (err) {
          console.error(err);
          setAddress(null);
        }
      };

      reverseGeocode();
    }
  }, [coords]);

  // FETCH IMAGE AND LOCATION DATA
  useEffect(() => {
    const fetchMediaAndLocationData = async () => {
      setIsLoading(true);

      try {
        const location = await Location.getCurrentPositionAsync({});
        setCoords({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        const result = await Location.reverseGeocodeAsync(location.coords);
        setAddress(result[0] || null);

        if (videoUri) {
          const metadata = await getVideoMetadata(videoUri);
          setVidMetaData(metadata);
          setImageMetaData(null);
        } else if (imageUri) {
          const info = await FileSystem.getInfoAsync(imageUri, { size: true });
          if (info.exists) {
            setImageMetaData({ size: info.size });
          } else {
            console.warn("Image file does not exist at the URI");
            setImageMetaData(null);
          }
          setVidMetaData(null);
        }

        setTimestamp(new Date().toLocaleString());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!videoUri && !imageUri) {
      setIsLoading(false);
      return;
    }

    fetchMediaAndLocationData();
  }, [videoUri, imageUri]);

  // SUBMIT BUTTON HOOK
  useEffect(() => {
    const allMediaReady =
      (videoUri && vidMetaData) || (imageUri && imageMetaData);
    const allDataLoaded = coords && sessionData && allMediaReady;

    setIsLoading(!allDataLoaded);
  }, [
    vidMetaData,
    imageMetaData,
    coords,
    timestamp,
    sessionData,
    videoUri,
    imageUri,
  ]);

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#020617",
        zIndex: 1,
      }}
    >
      <View
        style={{
          width: "auto",
          height: height * 0.25,
          backgroundColor: "#11162B",
          borderRadius: 16,
          overflow: "hidden",
          marginTop: height * 0.035,
          marginHorizontal: width * 0.055,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            justifyContent: "center",
            paddingHorizontal: width * 0.05,
          }}
        >
          <Text
            style={{
              width: "100%",
              color: "#f97316",
              fontSize: width * 0.07,
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            <FontAwesome size={width * 0.075} name="upload" />
          </Text>
          <Text
            style={{
              width: "100%",
              color: "#f97316",
              fontSize: width * 0.07,
              fontWeight: "bold",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            REPORT DETAILS
          </Text>

          <Text
            style={{
              color: "#94A3B8",
              fontSize: width * 0.035,
              textAlign: "center",
              marginTop: 8,
              paddingHorizontal: width * 0.1,
            }}
          >
            Verify full report details here!
          </Text>
        </View>
      </View>
      <ScrollView
        style={{
          width: "auto",
          height: height * 0.58,
          paddingHorizontal: width * 0.08,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.038,
            color: "#94a3b8",
            marginBottom: height * 0.015,
            letterSpacing: 0.8,
            marginTop: height * 0.03,
          }}
        >
          MEDIA DETAILS
        </Text>

        {videoUri && vidMetaData ? (
          <>
            {/* Render Video Metadata */}
            <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
              <View style={{ width: "50%", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: width * 0.035,
                    fontWeight: "600",
                    color: "#f97316",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Media Type
                </Text>
              </View>
              <View
                style={{
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#4A5568",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                  }}
                >
                  <FontAwesome
                    name="video-camera"
                    size={16}
                    color="#E2E8F0"
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={{
                      fontSize: width * 0.035,
                      color: "#E2E8F0",
                      lineHeight: height * 0.025,
                    }}
                  >
                    Video
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
              <View style={{ width: "50%", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: width * 0.035,
                    fontWeight: "600",
                    color: "#f97316",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Media Size
                </Text>
              </View>
              <View
                style={{
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    fontSize: width * 0.035,
                    color: "#E2E8F0",
                    lineHeight: height * 0.025,
                  }}
                >
                  {(vidMetaData.size! / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
              <View style={{ width: "50%", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: width * 0.035,
                    fontWeight: "600",
                    color: "#f97316",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Media Length
                </Text>
              </View>
              <View
                style={{
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    fontSize: width * 0.035,
                    color: "#E2E8F0",
                    lineHeight: height * 0.025,
                  }}
                >
                  {Math.round(vidMetaData.duration!)}s
                </Text>
              </View>
            </View>
          </>
        ) : imageUri && imageMetaData ? (
          <>
            {/* Render Image Metadata */}
            <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
              <View style={{ width: "50%", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: width * 0.035,
                    fontWeight: "600",
                    color: "#f97316",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Media Type
                </Text>
              </View>
              <View
                style={{
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#4A5568",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 20,
                  }}
                >
                  <FontAwesome
                    name="image"
                    size={16}
                    color="#E2E8F0"
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={{
                      fontSize: width * 0.035,
                      color: "#E2E8F0",
                      lineHeight: height * 0.025,
                    }}
                  >
                    Image
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
              <View style={{ width: "50%", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: width * 0.035,
                    fontWeight: "600",
                    color: "#f97316",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Media Size
                </Text>
              </View>
              <View
                style={{
                  width: "50%",
                  justifyContent: "center",
                  alignItems: "flex-end",
                }}
              >
                <Text
                  style={{
                    fontSize: width * 0.035,
                    color: "#E2E8F0",
                    lineHeight: height * 0.025,
                  }}
                >
                  {(imageMetaData.size! / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text
            style={{
              fontSize: width * 0.035,
              color: "#94A3B8",
              textAlign: "center",
              marginTop: height * 0.02,
            }}
          >
            Your video data is possibly being fetched, and your report might be
            loading!
          </Text>
        )}

        <Text
          style={{
            fontSize: width * 0.038,
            color: "#94a3b8",
            marginBottom: height * 0.015,
            letterSpacing: 0.8,
            marginTop: height * 0.03,
          }}
        >
          REPORTER DETAILS
        </Text>

        <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
          <View style={{ width: "50%", justifyContent: "center" }}>
            <Text
              style={{
                fontSize: width * 0.035,
                fontWeight: "600",
                color: "#f97316",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Full Name
            </Text>
          </View>
          <View
            style={{
              width: "50%",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#E2E8F0",
                lineHeight: height * 0.025,
              }}
            >
              {getFullName()}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
          <View style={{ width: "50%", justifyContent: "center" }}>
            <Text
              style={{
                fontSize: width * 0.035,
                fontWeight: "600",
                color: "#f97316",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Reputation Score
            </Text>
          </View>
          <View
            style={{
              width: "50%",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#E2E8F0",
                lineHeight: height * 0.025,
              }}
            >
              {sessionData ? sessionData.UA_reputation_score : "Loading..."}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: width * 0.038,
            color: "#94a3b8",
            marginBottom: height * 0.015,
            letterSpacing: 0.8,
            marginTop: height * 0.03,
          }}
        >
          REPORT DETAILS
        </Text>

        <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
          <View style={{ justifyContent: "center" }}>
            <Text
              style={{
                fontSize: width * 0.035,
                fontWeight: "600",
                color: "#f97316",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Report Address
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#E2E8F0",
                lineHeight: height * 0.025,
              }}
            >
              {address ? formatAddress(address) : "Loading..."}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
          <View style={{ width: "50%", justifyContent: "center" }}>
            <Text
              style={{
                fontSize: width * 0.035,
                fontWeight: "600",
                color: "#f97316",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Report Coordinates
            </Text>
          </View>
          <View
            style={{
              width: "50%",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#E2E8F0",
                lineHeight: height * 0.025,
              }}
            >
              {coords
                ? `${coords.latitude}, ${coords.longitude}`
                : "Loading..."}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", marginBottom: height * 0.01 }}>
          <View style={{ width: "50%", justifyContent: "center" }}>
            <Text
              style={{
                fontSize: width * 0.035,
                fontWeight: "600",
                color: "#f97316",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Submission Date
            </Text>
          </View>
          <View
            style={{
              width: "50%",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#E2E8F0",
                lineHeight: height * 0.025,
              }}
            >
              {timestamp || "Loading..."}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#11162B",
          height: height * 0.1,
          paddingHorizontal: width * 0.035,
          gap: width * 0.02,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 16,
            paddingHorizontal: width * 0.03,
            paddingVertical: height * 0.01,
            backgroundColor: "#f97316",
          }}
          onPress={() => {
            router.replace("/(dash)/(camera)/preview");
          }}
        >
          <FontAwesome
            name={"arrow-left"}
            size={width * 0.045}
            style={{ color: "#020617" }}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: width * 0.03,
              color: "#020617",
            }}
          >
            Back
          </Text>
        </TouchableOpacity>

        {isSubmissionSending ? (
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 16,
              paddingHorizontal: width * 0.03,
              paddingVertical: height * 0.01,
              backgroundColor: "#64748B",
              opacity: 0.7,
            }}
            disabled={true}
          >
            <FontAwesome
              name={"hourglass"}
              size={width * 0.045}
              style={{ color: "#94A3B8" }}
            />
            <Text
              style={{
                fontWeight: "bold",
                fontSize: width * 0.03,
                color: "#94A3B8",
              }}
            >
              {isLoading ? "Submitting..." : "Submitted!"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 16,
              paddingHorizontal: width * 0.03,
              paddingVertical: height * 0.01,
              backgroundColor: isLoading ? "#64748B" : "#f97316",
              opacity: isLoading ? 0.7 : 1,
            }}
            onPress={() => {
              {
                if (!isLoading) {
                  handleSubmitButton();
                }
              }
            }}
            disabled={isLoading}
          >
            <FontAwesome
              name={"upload"}
              size={width * 0.045}
              style={{ color: isLoading ? "#94A3B8" : "#020617" }}
            />
            <Text
              style={{
                fontWeight: "bold",
                fontSize: width * 0.03,
                color: isLoading ? "#94A3B8" : "#020617",
              }}
            >
              {isLoading ? "Loading..." : "Submit"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Video
        ref={videoReference}
        source={videoSource}
        style={{ width: 0, height: 0 }}
        useNativeControls={false}
        isMuted
        shouldPlay={false}
      />

      <Modal
        visible={isSubmissionSuccessVisible}
        transparent
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
        >
          <View
            style={{
              width: "80%",
              backgroundColor: "#1E293B",
              borderRadius: 20,
              padding: width * 0.075,
            }}
          >
            <Text
              style={{
                fontSize: width * 0.05,
                fontWeight: "bold",
                color: "#f97316",
                marginBottom: height * 0.02,
                textAlign: "center",
              }}
            >
              <FontAwesome name="check" size={width * 0.05} />
              {"  "}REPORT SUBMITTED!
            </Text>
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              Your report has been{" "}
              <Text style={{ color: "#10B981" }}>successfully submitted</Text>{" "}
              to the system. Thank you for your contribution! The system will
              review your submission shortly.
            </Text>

            <TouchableOpacity
              style={{
                marginTop: height * 0.03,
                backgroundColor: "#f97316",
                paddingVertical: height * 0.015,
                borderRadius: 8,
                alignItems: "center",
              }}
              onPress={onCloseSuccessModal}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  fontSize: width * 0.04,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SubmissionPanel;
