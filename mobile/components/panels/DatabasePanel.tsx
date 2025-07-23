import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Modal,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";

const { width, height } = Dimensions.get("window");
const dropdownOptions = ["User Accounts", "Submitted Reports", "Media Storage"];
const PAGE_SIZE = 10;

const DatabasePanel = () => {
  // button select states
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  // pagination states
  const [mediaPage, setMediaPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [reportPage, setReportPage] = useState(1);

  const {
    combinedReports,
    mediaStorage,
    userAccounts,
    fetchMediaStorageDetails,
  } = useAdminSQL();

  const renderRoleBadge = (role: string | undefined) => {
    let badgeStyle: { backgroundColor: string; color: string } = {
      backgroundColor: "",
      color: "",
    };
    let badgeText = "";

    switch (role) {
      case "guest":
        badgeStyle = {
          backgroundColor: "#111827", // GRAY
          color: "#FFFFFF",
        };
        badgeText = "Guest";
        break;
      case "civilian":
        badgeStyle = {
          backgroundColor: "#3B82F6", // BLUE
          color: "#FFFFFF",
        };
        badgeText = "Civilian";
        break;
      case "responder":
        badgeStyle = {
          backgroundColor: "#F59E0B", // AMBER
          color: "#FFFFFF",
        };
        badgeText = "Responder";
        break;
      case "admin":
        badgeStyle = {
          backgroundColor: "#EF4444", // RED
          color: "#FFFFFF",
        };
        badgeText = "Administrator";
        break;
      case "superadmin":
        badgeStyle = {
          backgroundColor: "#01B073", // TEAL
          color: "#FFFFFF",
        };
        badgeText = "Superadministrator";
        break;
      default:
        badgeStyle = {
          backgroundColor: "#6B7280", // CYAN
          color: "#FFFFFF",
        };
        badgeText = "Unknown Role";
        break;
    }

    return (
      <View
        style={[
          styles.roleBadge,
          {
            backgroundColor: badgeStyle.backgroundColor,
            borderRadius: 12,
          },
        ]}
      >
        <Text style={[styles.roleBadgeText, { color: badgeStyle.color }]}>
          {badgeText}
        </Text>
      </View>
    );
  };

  const renderMediaTypeBadge = (mediaType?: string) => {
    let badgeStyle = {
      backgroundColor: "#6B7280", // Default gray
      color: "#fff",
    };
    let badgeText = "Unknown";
    let iconName: "question" | "camera" | "video-camera" = "question";

    if (mediaType?.startsWith("image/")) {
      badgeStyle = {
        backgroundColor: "#22C55E", // emerald green
        color: "#fff",
      };
      badgeText = "Image";
      iconName = "camera";
    } else if (mediaType?.startsWith("video/")) {
      badgeStyle = {
        backgroundColor: "#7C3AED", // purple
        color: "#fff",
      };
      badgeText = "Video";
      iconName = "video-camera";
    }

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: badgeStyle.backgroundColor,
          borderRadius: 16,
          paddingHorizontal: 8,
          paddingVertical: 4,
          alignSelf: "flex-start",
          marginRight: 8,
        }}
      >
        <FontAwesome
          name={iconName}
          size={14}
          color={badgeStyle.color}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{
            color: badgeStyle.color,
            fontWeight: "bold",
            fontSize: 12,
          }}
        >
          {badgeText}
        </Text>
      </View>
    );
  };

  const generateVisualBadge = (level: string | undefined) => {
    if (level == undefined) {
      return (
        <View
          style={{
            backgroundColor: "#64748B",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 2,
            alignSelf: "flex-start",
            marginRight: 6,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 12 }}>None</Text>
        </View>
      );
    }

    const normalizedLevel = level.toLowerCase();
    let bg = "#64748B";

    if (["small", "mild", "low"].includes(normalizedLevel)) {
      bg = "#6EE7B7";
    } else if (["moderate", "medium"].includes(normalizedLevel)) {
      bg = "#FBBF24";
    } else if (["large", "severe", "high"].includes(normalizedLevel)) {
      bg = "#EF4444";
    }

    return (
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 2,
          alignSelf: "flex-start",
          marginRight: 6,
        }}
      >
        <Text style={{ color: "#111", fontSize: 12, fontWeight: "bold" }}>
          {normalizedLevel.charAt(0).toUpperCase() + normalizedLevel.slice(1)}
        </Text>
      </View>
    );
  };

  const generateConfidenceColor = (confidence: number | undefined) => {
    if (confidence === undefined) {
      return <Text style={{ color: "#64748B" }}>N/A</Text>;
    }

    const percentage = confidence;
    let color = "#EF4444"; // danger
    if (percentage >= 0 && percentage <= 40) {
      color = "#EF4444";
    } else if (percentage >= 41 && percentage <= 80) {
      color = "#FBBF24";
    } else if (percentage >= 81 && percentage <= 100) {
      color = "#22C55E";
    } else {
      return <Text style={{ color: "#64748B" }}>Invalid Value</Text>;
    }

    return <Text style={{ color, fontWeight: "bold" }}>{percentage}%</Text>;
  };

  const renderReportStatusBadge = (role: string | undefined) => {
    let badgeStyle = {
      backgroundColor: "#111827",
      color: "#FFFFFF",
    };
    let badgeText = "Unknown status";
    let iconName: keyof typeof FontAwesome.glyphMap = "question";

    switch (role) {
      case "pending":
        badgeStyle = { backgroundColor: "#F59E0B", color: "#000000" };
        badgeText = "Pending";
        iconName = "hourglass";
        break;
      case "verified":
        badgeStyle = { backgroundColor: "#3B82F6", color: "#FFFFFF" };
        badgeText = "Validated";
        iconName = "thumbs-up";
        break;
      case "false_alarm":
        badgeStyle = { backgroundColor: "#EF4444", color: "#FFFFFF" };
        badgeText = "False Alarm";
        iconName = "bell-slash";
        break;
      case "resolved":
        badgeStyle = { backgroundColor: "#22C55E", color: "#FFFFFF" };
        badgeText = "Resolved";
        iconName = "check-circle";
        break;
      default:
        badgeStyle = { backgroundColor: "#111827", color: "#FFFFFF" };
        badgeText = "Unknown status";
        iconName = "question";
        break;
    }

    return (
      <View
        style={{
          backgroundColor: badgeStyle.backgroundColor,
          borderRadius: 16,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: "flex-start",
          marginRight: 6,
        }}
      >
        <FontAwesome
          name={iconName}
          size={14}
          color={badgeStyle.color}
          style={{ marginRight: 6 }}
        />
        <Text
          style={{ color: badgeStyle.color, fontWeight: "bold", fontSize: 12 }}
        >
          {badgeText}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    const logMediaStorageDetails = async () => {
      const result = await fetchMediaStorageDetails();
    };
    logMediaStorageDetails();
  }, []);

  // memos to help with pagination
  const paginatedMediaStorage = useMemo(() => {
    if (!mediaStorage) return [];
    const start = (mediaPage - 1) * PAGE_SIZE;
    return mediaStorage.slice(start, start + PAGE_SIZE);
  }, [mediaStorage, mediaPage]);

  const paginatedUserAccounts = useMemo(() => {
    if (!userAccounts) return [];
    const start = (userPage - 1) * PAGE_SIZE;
    return userAccounts.slice(start, start + PAGE_SIZE);
  }, [userAccounts, userPage]);

  const paginatedReports = useMemo(() => {
    if (!combinedReports) return [];
    const start = (reportPage - 1) * PAGE_SIZE;
    return combinedReports.slice(start, start + PAGE_SIZE);
  }, [combinedReports, reportPage]);

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          marginTop: 24,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.panelTitle}>
            <FontAwesome
              name="info-circle"
              size={width * 0.055}
              color="#f97316"
            />
            {"  "}
            Description
          </Text>
          <Text style={styles.panelDesc}>
            This panel provides a preview of the database contents. For full
            CRUD operations and management, please use the web admin dashboard.
          </Text>
        </View>
      </View>

      {/* Dropdown */}
      <View style={styles.dropdownContainer}>
        <View style={styles.dropdownBox}>
          {dropdownOptions.map((option) => {
            const isSelected = selectedOption === option;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.tableButton,
                  isSelected && styles.tableButtonSelected,
                ]}
                onPress={() => setSelectedOption(option)}
              >
                <FontAwesome
                  name={
                    option === "User Accounts"
                      ? "users"
                      : option === "Submitted Reports"
                        ? "file-text"
                        : "database"
                  }
                  size={width * 0.045}
                  style={[
                    styles.tableButtonIcon,
                    isSelected && styles.tableButtonIconSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.tableButtonText,
                    isSelected && styles.tableButtonTextSelected,
                  ]}
                >
                  {option.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.cardsRow}>
        {/* User Account Accordions */}
        {selectedOption == "User Accounts" && (
          <>
            {/* User account rendering */}
            {userAccounts?.map((user) => {
              const cardKey = `user-${user.UA_user_id}`;
              return (
                <View
                  key={cardKey}
                  style={[
                    styles.cardBox,
                    openAccordion === cardKey && styles.cardBoxExpanded,
                  ]}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                      justifyContent: "space-between",
                    }}
                    onPress={() =>
                      setOpenAccordion(
                        openAccordion === cardKey ? null : cardKey
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <FontAwesome
                        name="user"
                        size={width * 0.045}
                        color="#f97316"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.cardTitle}>
                        User {user.UA_user_id}
                        {"  "}
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "light",
                            fontSize: width * 0.035,
                          }}
                        >
                          @{user.UA_username}
                        </Text>
                      </Text>
                    </View>
                    <FontAwesome
                      name={
                        openAccordion === cardKey
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={width * 0.04}
                      color="#f97316"
                    />
                  </TouchableOpacity>
                  {openAccordion === cardKey && (
                    <View style={{ marginTop: 6, flex: 1 }}>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Name</Text>
                        <Text style={styles.cardValue}>
                          {user.UA_first_name} {user.UA_middle_name}{" "}
                          {user.UA_last_name}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Username</Text>
                        <Text style={styles.cardValue}>
                          @{user.UA_username}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Email</Text>
                        <Text style={styles.cardValue}>
                          {user.UA_email_address}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Phone</Text>
                        <Text style={styles.cardValue}>
                          {user.UA_phone_number}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Role</Text>
                        {renderRoleBadge(user.UA_user_role)}
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Reputation</Text>
                        <Text style={styles.cardValue}>5300</Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Created At</Text>
                        <Text style={styles.cardValue}>
                          Sun, 29 Jun 2025 21:27:37 GMT
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Pagination controls */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 12,
                width: "100%",
                gap: 0,
              }}
            >
              <TouchableOpacity
                onPress={() => setUserPage((p) => Math.max(1, p - 1))}
                disabled={userPage === 1}
                style={{
                  flex: 1,
                  padding: 10,
                  borderWidth: 2,
                  borderColor: userPage === 1 ? "#64748B" : "#f97316",
                  borderRadius: 8,
                  marginRight: 8,
                  backgroundColor: "transparent",
                  alignItems: "center",
                  opacity: userPage === 1 ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: userPage === 1 ? "#64748B" : "#f97316",
                    fontWeight: "bold",
                  }}
                >
                  Prev
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  color: "#f97316",
                  alignSelf: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Page {userPage} / {Math.ceil(userAccounts.length / PAGE_SIZE)}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setUserPage((p) =>
                    Math.min(Math.ceil(userAccounts.length / PAGE_SIZE), p + 1)
                  )
                }
                disabled={
                  userPage === Math.ceil(userAccounts.length / PAGE_SIZE)
                }
                style={{
                  flex: 1,
                  padding: 10,
                  borderWidth: 2,
                  borderColor:
                    userPage === Math.ceil(userAccounts.length / PAGE_SIZE)
                      ? "#64748B"
                      : "#f97316",
                  borderRadius: 8,
                  marginLeft: 8,
                  backgroundColor: "transparent",
                  alignItems: "center",
                  opacity:
                    userPage === Math.ceil(userAccounts.length / PAGE_SIZE)
                      ? 0.5
                      : 1,
                }}
              >
                <Text
                  style={{
                    color:
                      userPage === Math.ceil(userAccounts.length / PAGE_SIZE)
                        ? "#64748B"
                        : "#f97316",
                    fontWeight: "bold",
                  }}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Media Storage Accordions */}
        {selectedOption == "Media Storage" && (
          <>
            {/* MS accordion rendering */}
            {paginatedMediaStorage.map((media) => {
              const cardKey = `media-${media.MS_media_id}`;
              return (
                <View
                  key={cardKey}
                  style={[
                    styles.cardBox,
                    openAccordion === cardKey && styles.cardBoxExpanded,
                  ]}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                      justifyContent: "space-between",
                    }}
                    onPress={() =>
                      setOpenAccordion(
                        openAccordion === cardKey ? null : cardKey
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <FontAwesome
                        name={
                          media.MS_file_type == "video/mp4"
                            ? "video-camera"
                            : "image"
                        }
                        size={width * 0.045}
                        color="#f97316"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.cardTitle}>
                        Media {media.MS_media_id}{" "}
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "light",
                            fontSize: width * 0.035,
                          }}
                        >
                          {media.MS_file_name.substring(0, 15)}...
                        </Text>
                      </Text>
                    </View>
                    <FontAwesome
                      name={
                        openAccordion === cardKey
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={width * 0.04}
                      color="#f97316"
                    />
                  </TouchableOpacity>
                  {openAccordion === cardKey && (
                    <View style={{ marginTop: 6, flex: 1 }}>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Media ID</Text>
                        <Text style={styles.cardValue}>
                          {media.MS_media_id}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>File Name</Text>
                        <Text style={styles.cardValue}>
                          {media.MS_file_name}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>File Type</Text>
                        <Text style={styles.cardValue}>
                          {renderMediaTypeBadge(media.MS_file_type)}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Uploaded By</Text>
                        <Text style={styles.cardValue}>
                          @
                          {userAccounts.find(
                            (user) => user.UA_user_id == media.MS_user_owner
                          )?.UA_username || "Unknown"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Pagination controls */}
            {mediaStorage && mediaStorage.length > PAGE_SIZE && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginVertical: 12,
                  width: "100%",
                  gap: 0,
                }}
              >
                <TouchableOpacity
                  onPress={() => setMediaPage((p) => Math.max(1, p - 1))}
                  disabled={mediaPage === 1}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderWidth: 2,
                    borderColor: mediaPage === 1 ? "#64748B" : "#f97316",
                    borderRadius: 8,
                    marginRight: 8,
                    backgroundColor: "transparent",
                    alignItems: "center",
                    opacity: mediaPage === 1 ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: mediaPage === 1 ? "#64748B" : "#f97316",
                      fontWeight: "bold",
                    }}
                  >
                    Prev
                  </Text>
                </TouchableOpacity>
                <Text
                  style={{
                    flex: 1,
                    color: "#f97316",
                    alignSelf: "center",
                    fontWeight: "bold",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  Page {mediaPage} /{" "}
                  {Math.ceil(mediaStorage.length / PAGE_SIZE)}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setMediaPage((p) =>
                      Math.min(
                        Math.ceil(mediaStorage.length / PAGE_SIZE),
                        p + 1
                      )
                    )
                  }
                  disabled={
                    mediaPage === Math.ceil(mediaStorage.length / PAGE_SIZE)
                  }
                  style={{
                    flex: 1,
                    padding: 10,
                    borderWidth: 2,
                    borderColor:
                      mediaPage === Math.ceil(mediaStorage.length / PAGE_SIZE)
                        ? "#64748B"
                        : "#f97316",
                    borderRadius: 8,
                    marginLeft: 8,
                    backgroundColor: "transparent",
                    alignItems: "center",
                    opacity:
                      mediaPage === Math.ceil(mediaStorage.length / PAGE_SIZE)
                        ? 0.5
                        : 1,
                  }}
                >
                  <Text
                    style={{
                      color:
                        mediaPage === Math.ceil(mediaStorage.length / PAGE_SIZE)
                          ? "#64748B"
                          : "#f97316",
                      fontWeight: "bold",
                    }}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Submitted Report Accordions */}
        {selectedOption == "Submitted Reports" && (
          <>
            {/* Report pagination rendering */}
            {paginatedReports.map((report, idx) => {
              const cardKey = `report-${report[0]?.PR_report_id ?? idx}`;
              return (
                <View
                  key={cardKey}
                  style={[
                    styles.cardBox,
                    openAccordion === cardKey && styles.cardBoxExpanded,
                  ]}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                      justifyContent: "space-between",
                    }}
                    onPress={() =>
                      setOpenAccordion(
                        openAccordion === cardKey ? null : cardKey
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <FontAwesome
                        name={
                          report[1] != null ? "check-square" : "question-circle"
                        }
                        size={width * 0.045}
                        color="#f97316"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.cardTitle}>
                        Submitted Report {report[0]?.PR_report_id ?? ""}
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "light",
                            fontSize: width * 0.035,
                          }}
                        >
                          {"  "}
                          {report[0].PR_address.substring(0, 15)}...
                        </Text>
                      </Text>
                    </View>
                    <FontAwesome
                      name={
                        openAccordion === cardKey
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={width * 0.04}
                      color="#f97316"
                    />
                  </TouchableOpacity>
                  {openAccordion === cardKey && (
                    <View style={{ marginTop: 6, flex: 1 }}>
                      <View
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 10,
                          marginTop: 4,
                        }}
                      >
                        <FontAwesome
                          name="file-text"
                          size={width * 0.045}
                          color="#94A3B8"
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={{
                            color: "#94A3B8",
                            fontWeight: "bold",
                            fontSize: width * 0.045,
                            letterSpacing: 1,
                          }}
                        >
                          SUBMITTED REPORT
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Report ID</Text>
                        <Text style={styles.cardValue}>
                          {report[0]?.PR_report_id}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Address</Text>
                        <Text style={styles.cardValue}>
                          {report[0]?.PR_address}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Coordinates</Text>
                        <Text style={styles.cardValue}>
                          {report[0].PR_latitude}, {report[0].PR_longitude}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Status</Text>
                        <View>
                          {renderReportStatusBadge(report[0]?.PR_report_status)}
                        </View>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Verified</Text>
                        <Text style={styles.cardValue}>
                          {report[0]?.PR_verified != false ? "Yes" : "No"}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>Timestamp</Text>
                        <Text style={styles.cardValue}>
                          {report[0]?.PR_timestamp}
                        </Text>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.cardKey}>
                          {report[0]?.PR_image ? "Image ID" : "Video ID"}
                        </Text>
                        <Text style={styles.cardValue}>
                          {report[0]?.PR_image ?? report[0]?.PR_video ?? "null"}
                        </Text>
                      </View>

                      <View
                        style={{
                          width: "100%",
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 10,
                          marginTop: 16,
                        }}
                      >
                        <FontAwesome
                          name="check-circle"
                          size={width * 0.045}
                          color="#94A3B8"
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={{
                            color: "#94A3B8",
                            fontWeight: "bold",
                            fontSize: width * 0.045,
                            letterSpacing: 1,
                          }}
                        >
                          VALIDATION REPORT
                        </Text>
                      </View>
                      <View style={{ width: "100%" }}>
                        {report[1] ? (
                          <>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardKey}>
                                Verification ID
                              </Text>
                              <Text style={styles.cardValue}>208</Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardKey}>
                                Confidence Score
                              </Text>
                              <Text style={styles.cardValue}>
                                {generateConfidenceColor(
                                  report[1].VR_confidence_score
                                )}
                              </Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardKey}>Detected</Text>
                              <Text style={styles.cardValue}>0</Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardKey}>Fire Type</Text>
                              <Text style={styles.cardValue}>
                                {generateVisualBadge(report[1].VR_fire_type)}
                              </Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardKey}>Severity Level</Text>
                              <Text style={styles.cardValue}>
                                {generateVisualBadge(
                                  report[1].VR_severity_level
                                )}
                              </Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardKey}>
                                Spread Potential
                              </Text>
                              <Text style={styles.cardValue}>
                                {generateVisualBadge(
                                  report[1].VR_spread_potential
                                )}
                              </Text>
                            </View>
                            <View style={styles.cardRow}>
                              <Text style={styles.cardKey}>
                                Verification Timestamp
                              </Text>
                              <Text style={styles.cardValue}>
                                Tue, 08 Jul 2025 12:01:25 GMT
                              </Text>
                            </View>
                          </>
                        ) : (
                          <Text style={styles.cardValue}>
                            This report is waiting for validation.
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Pagination controls */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginVertical: 12,
                width: "100%",
                gap: 0,
              }}
            >
              <TouchableOpacity
                onPress={() => setReportPage((p) => Math.max(1, p - 1))}
                disabled={reportPage === 1}
                style={{
                  flex: 1,
                  padding: 10,
                  borderWidth: 2,
                  borderColor: reportPage === 1 ? "#64748B" : "#f97316",
                  borderRadius: 8,
                  marginRight: 8,
                  backgroundColor: "transparent",
                  alignItems: "center",
                  opacity: reportPage === 1 ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: reportPage === 1 ? "#64748B" : "#f97316",
                    fontWeight: "bold",
                  }}
                >
                  Prev
                </Text>
              </TouchableOpacity>
              <Text
                style={{
                  flex: 1,
                  color: "#f97316",
                  alignSelf: "center",
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Page {reportPage} /{" "}
                {Math.ceil(combinedReports.length / PAGE_SIZE)}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setReportPage((p) =>
                    Math.min(
                      Math.ceil(combinedReports.length / PAGE_SIZE),
                      p + 1
                    )
                  )
                }
                disabled={
                  reportPage === Math.ceil(combinedReports.length / PAGE_SIZE)
                }
                style={{
                  flex: 1,
                  padding: 10,
                  borderWidth: 2,
                  borderColor:
                    reportPage === Math.ceil(combinedReports.length / PAGE_SIZE)
                      ? "#64748B"
                      : "#f97316",
                  borderRadius: 8,
                  marginLeft: 8,
                  backgroundColor: "transparent",
                  alignItems: "center",
                  opacity:
                    reportPage === Math.ceil(combinedReports.length / PAGE_SIZE)
                      ? 0.5
                      : 1,
                }}
              >
                <Text
                  style={{
                    color:
                      reportPage ===
                      Math.ceil(combinedReports.length / PAGE_SIZE)
                        ? "#64748B"
                        : "#f97316",
                    fontWeight: "bold",
                  }}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: "5%",
    width: "100%",
  },
  panelTitle: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: 4,
  },
  panelDesc: {
    color: "#94A3B8",
    fontSize: width * 0.035,
  },
  dropdownContainer: {
    marginBottom: 18,
  },
  dropdownLabel: {
    color: "#64748B",
    fontSize: width * 0.035,
    marginBottom: 6,
    fontWeight: "bold",
  },
  dropdownBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tableButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#00000000",
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 4,
    borderWidth: 1,
    borderColor: "#334155",
    height: width * 0.11,
  },
  tableButtonSelected: {
    backgroundColor: "#c2410c",
    borderColor: "#c2410c",
  },
  tableButtonText: {
    fontWeight: "bold",
    fontSize: width * 0.025,
    color: "#c2410c",
    marginLeft: 8,
  },
  tableButtonTextSelected: {
    color: "#11162B",
  },
  tableButtonIcon: {
    color: "#c2410c",
  },
  tableButtonIconSelected: {
    color: "#11162B",
  },
  cardsRow: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 12,
    justifyContent: "flex-start",
    width: "100%",
  },
  cardBox: {
    paddingHorizontal: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    transitionProperty: "height",
    transitionDuration: "200ms",
    paddingBottom: 4,
    borderBottomColor: "#11162B",
    borderBottomWidth: 2,
  },
  cardBoxExpanded: {
    height: "auto",
    minHeight: 250,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  cardKey: {
    fontWeight: "bold",
    color: "#f97316",
    fontSize: width * 0.032,
    marginBottom: 6,
    width: "30%",
  },
  cardValue: {
    color: "#E2E8F0",
    fontSize: width * 0.032,
    marginBottom: 6,
    width: "70%",
  },
  roleBadge: {
    backgroundColor: "#C2410C",
    borderRadius: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    marginVertical: 2,
  },
  roleBadgeText: {
    color: "#F8FAFC",
    fontWeight: "bold",
    fontSize: width * 0.032,
    paddingBottom: 4,
  },
  cardTitle: {
    color: "#f97316",
    fontWeight: "bold",
    fontSize: width * 0.04,
    marginBottom: 8,
  },
  cardInfo: {
    color: "#E2E8F0",
    fontSize: width * 0.032,
  },
});

export default DatabasePanel;
