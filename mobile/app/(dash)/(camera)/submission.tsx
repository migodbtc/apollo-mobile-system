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

const { width, height } = Dimensions.get("window");

const SubmissionPage = () => {
  const router = useRouter();
  const { sessionData, setSessionData } = useSession();
  const videoReference = useRef<Video>(null);
  const { videoUri } = useVideoUri();
  const [videoSource, setVideoSource] = useState<{ uri: string } | undefined>(
    undefined
  );
  const [vidMetaData, setVidMetaData] = useState<VideoMetadata | null>(null);

  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [address, setAddress] =
    useState<Location.LocationGeocodedAddress | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmissionSending, setIsSubmissionSending] = useState(false);

  const [isSubmissionSuccessVisible, setIsSubmissionSuccessVisible] =
    useState(false);

  const getFullName = () => {
    if (!sessionData) return "Loading...";
    const { UA_first_name, UA_middle_name, UA_last_name, UA_suffix } =
      sessionData;
    return `${UA_first_name} ${
      UA_middle_name ? UA_middle_name.charAt(0) + "." : ""
    } ${UA_last_name}${UA_suffix ? " " + UA_suffix : ""}`;
  };

  const formatAddress = (addr: Location.LocationGeocodedAddress | null) => {
    if (!addr) return "Loading address...";

    const parts = [
      addr.streetNumber,
      addr.street,
      addr.city,
      addr.region,
      addr.postalCode,
      addr.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

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
    if (isLoading || !vidMetaData || !coords || !sessionData?.UA_user_id) {
      // console.warn("Submission prevented: Missing required data");
      return;
    }

    try {
      // console.log("Creating form data...");
      // Create structured report object
      const reportPayload = {
        reporter: { id: sessionData.UA_user_id },
        location: {
          coordinates: coords,
          address: address ? formatAddress(address) : "Unknown location",
        },
        media: {
          size: vidMetaData.size,
          duration: vidMetaData.duration,
        },
        timestamp: timestamp,
      };

      const formData = new FormData();

      if (!vidMetaData.uri) {
        // console.error("Video URI is missing");
        throw new Error("Video URI is missing");
      }

      formData.append("video", {
        uri: vidMetaData.uri,
        type: "video/mp4",
        name: `report_${Date.now()}.mp4`,
      } as any);

      // Append JSON stringified report to form data
      formData.append("report", JSON.stringify(reportPayload));

      if (vidMetaData.size !== undefined) {
        formData.append("media[size]", String(vidMetaData.size));
      }

      if (vidMetaData.duration !== undefined) {
        formData.append("media[duration]", String(vidMetaData.duration));
      }

      formData.append("location[coordinates]", JSON.stringify(coords));
      formData.append(
        "location[address]",
        address ? formatAddress(address) : "Unknown location"
      );

      if (timestamp) {
        formData.append("timestamp", timestamp);
      }

      // Debugging FormData properly
      // console.log("FormData contents:");
      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }

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

      // console.log("Response:", uploadResponse);

      if (uploadResponse.status === 200) {
        setIsSubmissionSuccessVisible(true);
      } else {
        throw new Error(uploadResponse.data.message || "Upload failed");
      }
    } catch (error) {
      // console.error("Error in submission process:", error);
      alert(error || "An error occurred while submitting the report.");
    } finally {
      setIsSubmissionSending(false);
    }
  };

  const handleSubmitButton = () => {
    setIsSubmissionSending(true);
    sendReportToAPI();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
        setTimestamp(new Date().toLocaleString());
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchData();
  }, []);

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

  useEffect(() => {
    const fetchLocationAndMetadata = async () => {
      setIsLoading(true);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({});
          setCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
        setTimestamp(new Date().toLocaleString());

        if (videoUri) {
          const metadata = await getVideoMetadata(videoUri);
          setVidMetaData(metadata);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchLocationAndMetadata();
  }, [videoUri]);

  useEffect(() => {
    const allDataLoaded =
      vidMetaData !== null &&
      coords !== null &&
      timestamp !== "" &&
      sessionData !== null;

    setIsLoading(!allDataLoaded);
  }, [vidMetaData, coords, timestamp, sessionData]);

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
            <Text
              style={{
                fontSize: width * 0.035,
                color: "#E2E8F0",
                lineHeight: height * 0.025,
              }}
            >
              {vidMetaData ? "video/mp4" : "Loading..."}
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
              {vidMetaData
                ? `${(vidMetaData.size! / (1024 * 1024)).toFixed(2)} MB`
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
              {vidMetaData && vidMetaData.duration
                ? `${Math.round(vidMetaData.duration % 60)}s`
                : "Loading..."}
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
            router.push("/(dash)/(camera)/preview");
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
              onPress={() => {
                setIsSubmissionSuccessVisible(false);
                setVideoSource(undefined);
                setVidMetaData(null);
                setCoords(null);
                setTimestamp("");
                setIsLoading(true);
                setIsSubmissionSending(false);
                setIsSubmissionSuccessVisible(false);
                router.push("/(dash)/dashboard");
              }}
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

export default SubmissionPage;
