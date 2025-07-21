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
import ReportCard from "../dash/ReportCard";
import SelectedReportModal from "../dash/SelectedReportModal";
import SERVER_LINK from "@/constants/netvar";
import { useSession } from "@/constants/contexts/SessionContext";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import ReportHelpModal from "../dash/ReportHelpModal";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";

const { width, height } = Dimensions.get("window");

const dropdownOptions = ["User Accounts", "Submitted Reports", "Media Storage"];

const DatabasePanel = () => {
  const [selectedOption, setSelectedOption] = useState(dropdownOptions[0]);
  const [mediaStorageDetails, setMediaStorageDetails] = useState({});

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
        <ScrollView style={styles.cardBox}>
          <Text style={styles.cardTitle}>User Account</Text>
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>Name:</Text>
            <Text style={styles.cardInfo}>
              Super Idol IShowSpeed Ashton Hall Usk III
            </Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Username:
            </Text>
            <Text style={styles.cardInfo}>mgo</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>Email:</Text>
            <Text style={styles.cardInfo}>
              sigmaruleralphamale@tesco.org.ph
            </Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>Phone:</Text>
            <Text style={styles.cardInfo}>0965183774</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>Role:</Text>
            <View
              style={{
                backgroundColor: "#C2410C",
                borderRadius: 8,
                alignSelf: "flex-start",
                paddingHorizontal: 8,
                marginVertical: 2,
              }}
            >
              <Text style={{ color: "#F8FAFC", fontWeight: "bold" }}>
                superadmin
              </Text>
            </View>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Reputation:
            </Text>
            <Text style={styles.cardInfo}>5300</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Created At:
            </Text>
            <Text style={styles.cardInfo}>Sun, 29 Jun 2025 21:27:37 GMT</Text>
          </View>
        </ScrollView>

        {/* Media Storage Card */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Media Storage</Text>
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              File Name:
            </Text>
            <Text style={styles.cardInfo}>
              ID17TIME111422DATE20250517IMAGE.jpg
            </Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              File Type:
            </Text>
            <Text style={styles.cardInfo}>image/jpeg</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Media ID:
            </Text>
            <Text style={styles.cardInfo}>98</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              User Owner:
            </Text>
            <Text style={styles.cardInfo}>17</Text>
          </View>
        </View>

        {/* Submitted Report Card - with validation */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Submitted Report (Validated)</Text>
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Report ID:
            </Text>
            <Text style={styles.cardInfo}>77</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Address:
            </Text>
            <Text style={styles.cardInfo}>
              Makisig Corner Masikap, Manila, Metro Manila, 1016, Philippines
            </Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Latitude/Longitude:
            </Text>
            <Text style={styles.cardInfo}>14.5910532, 121.0232965</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Status:
            </Text>
            <View
              style={{
                backgroundColor: "#C2410C",
                borderRadius: 8,
                alignSelf: "flex-start",
                paddingHorizontal: 8,
                marginVertical: 2,
              }}
            >
              <Text style={{ color: "#F8FAFC", fontWeight: "bold" }}>
                false_alarm
              </Text>
            </View>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Verified:
            </Text>
            <Text style={styles.cardInfo}>1</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Timestamp:
            </Text>
            <Text style={styles.cardInfo}>Sat, 17 May 2025 11:14:23 GMT</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Image ID:
            </Text>
            <Text style={styles.cardInfo}>98</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>Video:</Text>
            <Text style={styles.cardInfo}>null</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Validation Report:
            </Text>
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.cardInfo}>Verification ID: 208</Text>
              <Text style={styles.cardInfo}>Confidence Score: 52.63</Text>
              <Text style={styles.cardInfo}>Detected: 0</Text>
              <Text style={styles.cardInfo}>Fire Type: null</Text>
              <Text style={styles.cardInfo}>Severity Level: null</Text>
              <Text style={styles.cardInfo}>Spread Potential: null</Text>
              <Text style={styles.cardInfo}>
                Verification Timestamp: Tue, 08 Jul 2025 12:01:25 GMT
              </Text>
            </View>
          </View>
        </View>

        {/* Submitted Report Card - without validation */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Submitted Report (No Validation)</Text>
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Report ID:
            </Text>
            <Text style={styles.cardInfo}>88</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Address:
            </Text>
            <Text style={styles.cardInfo}>Example Address, City, Country</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Latitude/Longitude:
            </Text>
            <Text style={styles.cardInfo}>15.000000, 120.000000</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Status:
            </Text>
            <View
              style={{
                backgroundColor: "#D97706",
                borderRadius: 8,
                alignSelf: "flex-start",
                paddingHorizontal: 8,
                marginVertical: 2,
              }}
            >
              <Text style={{ color: "#F8FAFC", fontWeight: "bold" }}>
                pending
              </Text>
            </View>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Verified:
            </Text>
            <Text style={styles.cardInfo}>0</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Timestamp:
            </Text>
            <Text style={styles.cardInfo}>Sun, 20 Jul 2025 10:00:00 GMT</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Image ID:
            </Text>
            <Text style={styles.cardInfo}>101</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>Video:</Text>
            <Text style={styles.cardInfo}>null</Text>
            <Text style={{ fontWeight: "bold", color: "#f97316" }}>
              Validation Report:
            </Text>
            <Text style={styles.cardInfo}>None</Text>
          </View>
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
    backgroundColor: "#11162B",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    height: 250,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    color: "#f97316",
    fontWeight: "bold",
    fontSize: width * 0.04,
    marginBottom: 4,
  },
  cardInfo: {
    color: "#E2E8F0",
    fontSize: width * 0.032,
  },
});

export default DatabasePanel;
