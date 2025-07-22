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

const DatabasePanel = () => {
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const [mediaAccordionOpen, setMediaAccordionOpen] = useState(false);
  const [reportValAccordionOpen, setReportValAccordionOpen] = useState(false);
  const [reportNoValAccordionOpen, setReportNoValAccordionOpen] =
    useState(false);

  const {
    combinedReports,
    mediaStorage,
    userAccounts,
    fetchMediaStorageDetails,
  } = useAdminSQL();

  useEffect(() => {
    const logMediaStorageDetails = async () => {
      const result = await fetchMediaStorageDetails();
    };
    logMediaStorageDetails();
  }, []);

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

      {/* Sample Cards (dummy data matching log structure, formatted) */}
      <View style={styles.cardsRow}>
        {/* User Account Card */}
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
                  setOpenAccordion(openAccordion === cardKey ? null : cardKey)
                }
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                    openAccordion === cardKey ? "chevron-up" : "chevron-down"
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
                    <Text style={styles.cardValue}>@{user.UA_username}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardKey}>Email</Text>
                    <Text style={styles.cardValue}>
                      {user.UA_email_address}
                    </Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Text style={styles.cardKey}>Phone</Text>
                    <Text style={styles.cardValue}>{user.UA_phone_number}</Text>
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

        {/* Media Storage Card */}
        <View
          style={[styles.cardBox, mediaAccordionOpen && styles.cardBoxExpanded]}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
              justifyContent: "space-between",
            }}
            onPress={() => setMediaAccordionOpen((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="database"
                size={width * 0.045}
                color="#f97316"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.cardTitle}>Media Storage</Text>
            </View>
            <FontAwesome
              name={mediaAccordionOpen ? "chevron-up" : "chevron-down"}
              size={width * 0.04}
              color="#f97316"
            />
          </TouchableOpacity>
          {mediaAccordionOpen && (
            <View style={{ marginTop: 6, flex: 1 }}>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>File Name</Text>
                <Text style={styles.cardValue}>
                  ID17TIME111422DATE20250517IMAGE.jpg
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>File Type</Text>
                <Text style={styles.cardValue}>image/jpeg</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Media ID</Text>
                <Text style={styles.cardValue}>98</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>User Owner</Text>
                <Text style={styles.cardValue}>17</Text>
              </View>
            </View>
          )}
        </View>

        {/* Submitted Report Card - with validation */}
        <View
          style={[
            styles.cardBox,
            reportValAccordionOpen && styles.cardBoxExpanded,
          ]}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
              justifyContent: "space-between",
            }}
            onPress={() => setReportValAccordionOpen((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="file-text"
                size={width * 0.045}
                color="#f97316"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.cardTitle}>Submitted Report (Validated)</Text>
            </View>
            <FontAwesome
              name={reportValAccordionOpen ? "chevron-up" : "chevron-down"}
              size={width * 0.04}
              color="#f97316"
            />
          </TouchableOpacity>
          {reportValAccordionOpen && (
            <View style={{ marginTop: 6, flex: 1 }}>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Report ID</Text>
                <Text style={styles.cardValue}>77</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Address</Text>
                <Text style={styles.cardValue}>
                  Makisig Corner Masikap, Manila, Metro Manila, 1016,
                  Philippines
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Latitude/Longitude</Text>
                <Text style={styles.cardValue}>14.5910532, 121.0232965</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Status</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>false_alarm</Text>
                </View>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Verified</Text>
                <Text style={styles.cardValue}>1</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Timestamp</Text>
                <Text style={styles.cardValue}>
                  Sat, 17 May 2025 11:14:23 GMT
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Image ID</Text>
                <Text style={styles.cardValue}>98</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Video</Text>
                <Text style={styles.cardValue}>null</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Validation Report</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardValue}>Verification ID: 208</Text>
                  <Text style={styles.cardValue}>Confidence Score: 52.63</Text>
                  <Text style={styles.cardValue}>Detected: 0</Text>
                  <Text style={styles.cardValue}>Fire Type: null</Text>
                  <Text style={styles.cardValue}>Severity Level: null</Text>
                  <Text style={styles.cardValue}>Spread Potential: null</Text>
                  <Text style={styles.cardValue}>
                    Verification Timestamp: Tue, 08 Jul 2025 12:01:25 GMT
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Submitted Report Card - without validation */}
        <View
          style={[
            styles.cardBox,
            reportNoValAccordionOpen && styles.cardBoxExpanded,
          ]}
        >
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
              justifyContent: "space-between",
            }}
            onPress={() => setReportNoValAccordionOpen((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="file-text"
                size={width * 0.045}
                color="#f97316"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.cardTitle}>
                Submitted Report (No Validation)
              </Text>
            </View>
            <FontAwesome
              name={reportNoValAccordionOpen ? "chevron-up" : "chevron-down"}
              size={width * 0.04}
              color="#f97316"
            />
          </TouchableOpacity>
          {reportNoValAccordionOpen && (
            <View style={{ marginTop: 6, flex: 1 }}>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Report ID</Text>
                <Text style={styles.cardValue}>88</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Address</Text>
                <Text style={styles.cardValue}>
                  Example Address, City, Country
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Latitude/Longitude</Text>
                <Text style={styles.cardValue}>15.000000, 120.000000</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Status</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>pending</Text>
                </View>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Verified</Text>
                <Text style={styles.cardValue}>0</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Timestamp</Text>
                <Text style={styles.cardValue}>
                  Sun, 20 Jul 2025 10:00:00 GMT
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Image ID</Text>
                <Text style={styles.cardValue}>101</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Video</Text>
                <Text style={styles.cardValue}>null</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardKey}>Validation Report</Text>
                <Text style={styles.cardValue}>None</Text>
              </View>
            </View>
          )}
        </View>
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
