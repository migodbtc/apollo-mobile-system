import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getSeverityColor, getStatusColor } from "./ReportCard";
import { SelectedReportModalProps } from "@/constants/interfaces/components";
import { FontAwesome } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import axios from "axios";
import SERVER_LINK from "@/constants/netvar";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

const { width, height } = Dimensions.get("window");
const VIDEO_HEIGHT = width * 0.95;
const VIDEO_WIDTH = (VIDEO_HEIGHT * 9) / 16;

const getConfidenceColor = (score: number) => {
  if (score >= 90) return "#10B981";
  if (score >= 70) return "#3B82F6";
  if (score >= 50) return "#FBBF24";
  return "#EF4444";
};

const SelectedReportModal: React.FC<SelectedReportModalProps> = ({
  visible,
  onClose,
  selectedReport,
}) => {
  const [subSelection, setSubSelection] = useState<number>(0);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  // MEDIA SETUP
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const player = useVideoPlayer(videoUri ?? "", (player) => {
    player.loop = true;
  });
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  // SYNC FUNCTIONS
  const resetMediaState = () => {
    setLoadingVideo(false);
    setLoadingImage(false);
    setVideoUri(null);
    setImageUri(null);
    player?.pause?.();
  };

  const handleSelectionButton = (index: number) => {
    if (subSelection === 1 && index !== 1) {
      resetMediaState();
    }
    setSubSelection(index);
  };

  const handleModalClose = () => {
    resetMediaState();
    onClose();
  };

  // ASYNC FUNCTIONS
  const handleFetchVideo = async () => {
    setLoadingVideo(true);

    try {
      const payload = {
        MS_media_id: selectedReport?.[0].PR_video,
      };

      console.log(selectedReport);

      const responseOne = await axios.post(
        `${SERVER_LINK}/media/details/get/one`,
        payload
      );

      if (responseOne.status !== 200) {
        throw new Error(responseOne.data.message || "Video fetching failed");
      }

      console.log("Fetching video details...");
      console.log(responseOne.data);

      const responseTwo = await axios.post(
        `${SERVER_LINK}/media/blob/get/one`,
        payload,
        { responseType: "arraybuffer" }
      );
      // console.log("Raw buffer (arraybuffer):", responseTwo.data);

      const buffer = responseTwo.data;
      // console.log("Buffer byteLength:", buffer.byteLength);

      const base64String = Buffer.from(buffer, "binary").toString("base64");
      // console.log("Base64 string length:", base64String.length);
      // console.log("Base64 preview:", base64String.slice(0, 100));

      const fileUri =
        FileSystem.cacheDirectory + `${responseOne.data["MS_file_name"]}`;
      await FileSystem.writeAsStringAsync(fileUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // console.log("File written to:", fileUri);

      setVideoUri(fileUri);
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleFetchImage = async () => {
    setLoadingImage(true);

    try {
      const payload = {
        MS_media_id: selectedReport?.[0].PR_image,
      };

      const responseOne = await axios.post(
        `${SERVER_LINK}/media/details/get/one`,
        payload
      );

      if (responseOne.status !== 200) {
        throw new Error(responseOne.data.message || "Image fetching failed");
      }

      console.log("Fetching video details...");
      console.log(responseOne.data);

      const responseTwo = await axios.post(
        `${SERVER_LINK}/media/blob/get/one`,
        payload,
        { responseType: "arraybuffer" }
      );
      // console.log("Raw buffer (arraybuffer):", responseTwo.data);

      const buffer = responseTwo.data;
      // console.log("Buffer byteLength:", buffer.byteLength);

      const base64String = Buffer.from(buffer, "binary").toString("base64");
      // console.log("Base64 string length:", base64String.length);
      // console.log("Base64 preview:", base64String.slice(0, 100));

      const fileUri =
        FileSystem.cacheDirectory + `${responseOne.data["MS_file_name"]}`;
      await FileSystem.writeAsStringAsync(fileUri, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // console.log("File written to:", fileUri);

      setImageUri(fileUri);
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoadingImage(false);
    }
  };

  // HELPER COMPONENTS
  const MediaLoadButton = ({
    onPress,
    icon,
    label,
  }: {
    onPress: () => void;
    icon: any;
    label: string;
  }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "#f97316",
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.05,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3,
        flexDirection: "row",
        gap: 8,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <FontAwesome name={icon} size={width * 0.05} color="#fff" />
      <Text
        style={{
          color: "#fff",
          fontWeight: "bold",
          fontSize: width * 0.045,
          marginLeft: 8,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleModalClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {selectedReport ? (
            <>
              <Text style={styles.modalTitle}>
                <FontAwesome
                  name="file-text-o"
                  size={width * 0.055}
                  color="#f97316"
                />
                {"  "}
                Report Details
              </Text>
              <Text
                style={{
                  color: "#94A3B8",
                  fontSize: width * 0.032,
                  width: "100%",
                  textAlign: "center",
                  marginBottom: height * 0.01,
                }}
              >
                Navigate the details with the buttons below.
              </Text>
              <View
                style={{
                  width: "100%",
                  height: height * 0.05,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  marginVertical: height * 0.015,
                  gap: 8,
                  marginBottom: 0,
                }}
              >
                <TouchableOpacity
                  style={{
                    height: "100%",
                    backgroundColor: subSelection === 0 ? "#f97316" : "#1E293B",
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 10,
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                  }}
                  onPress={() => handleSelectionButton(0)}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: subSelection === 0 ? "#1E293B" : "#f97316",
                    }}
                  >
                    DETAILS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    height: "100%",
                    backgroundColor: subSelection === 1 ? "#f97316" : "#1E293B",
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 10,
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignContent: "center",
                  }}
                  onPress={() => handleSelectionButton(1)}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: subSelection === 1 ? "#1E293B" : "#f97316",
                    }}
                  >
                    {selectedReport[0]?.PR_video
                      ? "VIDEO"
                      : selectedReport[0]?.PR_image
                        ? "IMAGE"
                        : ""}
                  </Text>
                </TouchableOpacity>
                {selectedReport[1] && (
                  <TouchableOpacity
                    style={{
                      height: "100%",
                      backgroundColor:
                        subSelection === 2 ? "#f97316" : "#1E293B",
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 10,
                      alignItems: "center",
                      display: "flex",
                      justifyContent: "center",
                      alignContent: "center",
                    }}
                    onPress={() => handleSelectionButton(2)}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        color: subSelection === 2 ? "#1E293B" : "#f97316",
                      }}
                    >
                      VALIDATION
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* DETAILS SEGMENT */}
              {subSelection == 0 && (
                <>
                  <Text
                    style={[
                      styles.verificationTitle,
                      { marginTop: height * 0.015 },
                    ]}
                  >
                    ID & LOCATION
                  </Text>
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Report ID</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedReport[0]?.PR_report_id}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>Location</Text>
                  <Text style={styles.sectionText}>
                    {selectedReport[0]?.PR_address || "Not specified"}
                    {"\n"}
                    <Text style={{ color: "#94A3B8", fontSize: width * 0.032 }}>
                      ({selectedReport[0]?.PR_latitude},{" "}
                      {selectedReport[0]?.PR_longitude})
                    </Text>
                  </Text>

                  <Text
                    style={[
                      styles.verificationTitle,
                      { marginTop: height * 0.03 },
                    ]}
                  >
                    REPORT STATUS
                  </Text>

                  {/* STATUS */}
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Status</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: getStatusColor(
                              selectedReport[0]?.PR_report_status
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {selectedReport[0]?.PR_report_status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Submitted Section */}
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Submitted</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        <Text style={{ textAlign: "right" }}>
                          {new Date(
                            selectedReport[0]?.PR_timestamp
                          ).toUTCString()}
                        </Text>
                      </Text>
                    </View>
                  </View>

                  {/* Validation Segment */}
                  {selectedReport[1] &&
                    selectedReport[1].VR_detected == true && (
                      <>
                        <Text style={[styles.verificationTitle]}>
                          VALIDATION DETAILS
                        </Text>
                        <Text style={styles.sectionText}>
                          The report has been validated, either by the system
                          itself or by human validation.
                        </Text>
                        <Text
                          style={{ color: "#94A3B8", fontSize: width * 0.032 }}
                        >
                          The details of the validation can be found within the
                          third tab of the modal or the "Validation" tab.
                        </Text>
                      </>
                    )}
                  {selectedReport[0].PR_report_status == "false_alarm" && (
                    <>
                      <Text style={[styles.verificationTitle]}>
                        VALIDATION DETAILS
                      </Text>
                      <Text style={styles.sectionText}>
                        The report has been validated by the system, but no fire
                        has been detected in the reported location.
                      </Text>
                      <Text
                        style={{ color: "#94A3B8", fontSize: width * 0.032 }}
                      >
                        This could mean that the system's analysis confirmed no
                        active fire or smoke within the area at the time of
                        detection, or that the report was a false alarm.
                      </Text>
                    </>
                  )}
                  {selectedReport[0].PR_report_status == "pending" && (
                    <>
                      <Text style={[styles.verificationTitle]}>
                        VALIDATION DETAILS
                      </Text>
                      <Text style={styles.sectionText}>
                        The report is still pending validation...
                      </Text>
                    </>
                  )}
                </>
              )}

              {/* MEDIA SEGMENT */}
              {subSelection == 1 && (
                <View
                  style={{
                    width: VIDEO_WIDTH,
                    height: VIDEO_HEIGHT,
                    backgroundColor: imageUri || videoUri ? "black" : "#18181b",
                    borderRadius: 14,
                    justifyContent: "center",
                    alignItems: "center",
                    marginVertical: height * 0.02,
                    overflow: "hidden",
                    alignSelf: "center",
                  }}
                >
                  {selectedReport[0]?.PR_video ? (
                    loadingVideo ? (
                      <ActivityIndicator size="large" color="#f97316" />
                    ) : videoUri ? (
                      <VideoView
                        style={{ width: "100%", height: "100%" }}
                        player={player}
                        allowsFullscreen
                        allowsPictureInPicture
                      />
                    ) : (
                      <MediaLoadButton
                        onPress={handleFetchVideo}
                        icon="play-circle"
                        label="LOAD"
                      />
                    )
                  ) : selectedReport[0]?.PR_image ? (
                    loadingImage ? (
                      <ActivityIndicator size="large" color="#f97316" />
                    ) : imageUri ? (
                      <Image
                        source={{ uri: imageUri }}
                        style={{
                          width: "100%",
                          height: "100%",
                          resizeMode: "contain",
                        }}
                      />
                    ) : (
                      <MediaLoadButton
                        onPress={handleFetchImage}
                        icon="image"
                        label="LOAD"
                      />
                    )
                  ) : (
                    <Text style={{ color: "#fff", textAlign: "center" }}>
                      No media available.
                    </Text>
                  )}
                </View>
              )}

              {/* VALIDATION SEGMENT ENHANCED */}
              {subSelection == 2 && selectedReport[1] && (
                <>
                  <Text
                    style={[
                      styles.verificationTitle,
                      { marginTop: height * 0.015 },
                    ]}
                  >
                    DETECTION INFORMATION
                  </Text>
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Fire?</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedReport[1]?.VR_detected ? "Yes" : "No"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Confidence</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedReport[1]?.VR_confidence_score}%
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.verificationTitle,
                      { marginTop: height * 0.015 },
                    ]}
                  >
                    FIRE ANALYSIS
                  </Text>
                  {selectedReport[1].VR_detected && (
                    <>
                      <View style={styles.twoColumnContainer}>
                        <View style={styles.labelColumn}>
                          <Text style={styles.sectionTitle}>Fire Type</Text>
                        </View>
                        <View style={styles.contentColumn}>
                          <Text style={styles.sectionText}>
                            {selectedReport[1]?.VR_fire_type
                              ? selectedReport[1]?.VR_fire_type.toUpperCase()
                              : "Unknown"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.twoColumnContainer}>
                        <View style={styles.labelColumn}>
                          <Text style={styles.sectionTitle}>
                            Severity Level
                          </Text>
                        </View>
                        <View style={styles.contentColumn}>
                          <Text style={styles.sectionText}>
                            {selectedReport[1]?.VR_severity_level
                              ? selectedReport[1]?.VR_severity_level.toUpperCase()
                              : "Unknown"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.twoColumnContainer}>
                        <View style={styles.labelColumn}>
                          <Text style={styles.sectionTitle}>
                            Spread Potential
                          </Text>
                        </View>
                        <View style={styles.contentColumn}>
                          <Text style={styles.sectionText}>
                            {selectedReport[1]?.VR_spread_potential
                              ? selectedReport[1]?.VR_spread_potential.toUpperCase()
                              : "Unknown"}
                          </Text>
                        </View>
                      </View>
                    </>
                  )}
                  {selectedReport[1].VR_detected == false && (
                    <Text style={styles.sectionText}>
                      The validation report indicates that no fire was detected
                      in the reported location, therefore no other details will
                      be listed here.
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.verificationTitle,
                      { marginTop: height * 0.015 },
                    ]}
                  >
                    ADDITIONAL DETAILS
                  </Text>
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Timestamp</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        <Text style={{ textAlign: "right" }}>
                          {new Date(
                            selectedReport[1]?.VR_verification_timestamp
                          ).toUTCString()}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* CLOSE REPORT BUTTON */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleModalClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Close Report</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noReportText}>No report selected</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: width * 0.06,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#f97316",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: height * 0.02,
  },
  sectionTitle: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#f97316",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: width * 0.038,
    color: "#E2E8F0",
    lineHeight: height * 0.025,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.01,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    paddingVertical: 2,
    marginLeft: width * 0.02,
  },
  badgeText: {
    color: "#F8FAFC",
    fontSize: width * 0.035,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: height * 0.02,
  },
  closeButton: {
    marginTop: height * 0.03,
    backgroundColor: "#f97316",
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: width * 0.042,
    letterSpacing: 0.5,
  },
  noReportText: {
    fontSize: width * 0.04,
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: height * 0.03,
  },
  twoColumnContainer: {
    flexDirection: "row",
    marginBottom: height * 0.01,
  },
  labelColumn: {
    width: "50%",
    justifyContent: "center",
  },
  contentColumn: {
    width: "50%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  badgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  verificationTitle: {
    fontSize: width * 0.032,
    color: "#94a3b8",
    marginBottom: height * 0.015,
    letterSpacing: 0.8,
    marginTop: height * 0.02,
  },
});

export default SelectedReportModal;
