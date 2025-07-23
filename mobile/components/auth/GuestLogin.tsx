import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  View,
  Text,
  Alert,
  ScrollView,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import PulsatingMarker from "../dash/PulsatingMarker";
import MapView, { Marker, UrlTile } from "react-native-maps";
import LoadingMapPanel from "../dash/LoadingMapScreen";
import LoginBox from "./LoginBox";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";
import * as Animatable from "react-native-animatable";
import SelectedReportModal from "../dash/SelectedReportModal";
import { CombinedReport } from "@/constants/types/database";

const { width, height } = Dimensions.get("window");

const GuestLogin = () => {
  // STATE VARIABLES
  const [loading, setLoading] = useState(true);
  const [showPreverified, setShowPreverified] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedReport, setSelectedReport] = useState<CombinedReport | null>(
    null
  );
  const [isSelectedModalVisible, setIsSelectedModalVisible] =
    useState<boolean>(false);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const { combinedReports, refreshAll } = useAdminSQL();

  const dailyCombinedReports = combinedReports.filter(([report]) => {
    if (!report) return false;

    const reportDateObj = new Date(report.PR_timestamp);
    const today = new Date();

    const comparisonDate =
      reportDateObj.getUTCFullYear() === today.getUTCFullYear() &&
      reportDateObj.getUTCMonth() === today.getUTCMonth() &&
      reportDateObj.getUTCDate() === today.getUTCDate();

    return comparisonDate;
  });

  //   STATIC DATA
  const rolesData = [
    {
      role: "Guest",
      description:
        "Guests have no authorization access to the application, but can view key information such as the report map rendering and contact information of the responders. Guests can register an account to become a Civilian.",
    },
    {
      role: "Civilian",
      description:
        "Civilian users are users who have registered an account, and can do a varying of options such as submitting reports, viewing reports on the map, and viewing their own submitted media. Civilian users can also edit their own user profiles.",
    },
    {
      role: "Responder",
      description:
        "Responders are users who have been granted the responder role, and can do additional tasks such as viewing all reports, manually verifying reports, and having reports and analytics within the application.",
    },
    {
      role: "Admin",
      description:
        "Administrators are users who are mainly responsible for the user management of the system such as giving accounts the 'responder' role, verifying responder information, penalizing uncompliant users, and managing the flow of the system.",
    },
    {
      role: "Superadmin",
      description:
        "Superadministrators are the highest level of users within the system, and are responsible for the maintenance and development of the system. They can do everything that an administrator can do, but also have access to the system's settings, configurations, and overall management of the application.",
    },
  ];

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
        style={{
          backgroundColor: badgeStyle.backgroundColor,
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: "flex-start",
          marginHorizontal: 8,
        }}
      >
        <Text
          style={{
            color: badgeStyle.color,
            fontSize: width * 0.025,
            fontWeight: "bold",
          }}
        >
          {badgeText}
        </Text>
      </View>
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    try {
      refreshAll();
    } catch (e) {
      Alert.alert("Refresh error", "Failed to refresh the reports!");
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const closeSelectedReportModal = () => {
    setIsSelectedModalVisible(false);
  };

  // EFFECT HOOKS
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (isMounted) setLoading(false);
          return;
        }

        await refreshAll();

        const userLocation = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          setLocation({
            latitude: userLocation.coords.latitude,
            longitude: userLocation.coords.longitude,
          });
          setLoading(false);
        }
      } catch (error) {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <SafeAreaView
        className="flex-1 bg-slate-950"
        edges={["left", "right", "bottom"]}
      >
        <ScrollView>
          <View
            className="items-center justify-center p-2"
            style={{
              height: height,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "100%",
                height: "35%",
                aspectRatio: width / (height * 0.3),
                overflow: "hidden",
                position: "relative",
                backgroundColor: "transparent",
                padding: 0,
              }}
            >
              <Image
                source={require("../../assets/images/apolloGraphic.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </View>
            <View style={{ width: "100%", height: "55%" }}>
              <LoginBox />
            </View>
            <View
              style={{ width: "100%", height: "10%", alignItems: "center" }}
            >
              <Animatable.Text
                animation={{
                  0: { translateY: 0 },
                  0.5: { translateY: -10 },
                  1: { translateY: 0 },
                }}
                duration={2000}
                iterationCount="infinite"
                direction="alternate"
                style={{
                  color: "#313D50",
                  fontSize: width * 0.035,
                  fontWeight: "600",
                }}
              >
                <FontAwesome name="caret-down" size={width * 0.04} />
                {"  "}Scroll down for more information!
              </Animatable.Text>
            </View>
          </View>
          <View
            style={{
              flex: 1,
              height: height * 0.95,
              padding: width * 0.05,
              paddingTop: height * 0.03,
            }}
          >
            <Text
              style={{
                color: "#F97316",
                fontSize: width * 0.045,
                fontWeight: "bold",
                marginTop: 24,
              }}
            >
              <FontAwesome name="users" size={width * 0.045} />
              {"  "}Current Reports
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: width * 0.03,
                lineHeight: 24,
                marginTop: width * 0.03,
              }}
            >
              Below is a map rendering of the current reports for
              <Text
                style={{
                  color: "#F97316",
                  fontWeight: "bold",
                  marginTop: 24,
                }}
              >
                {" " + new Date(Date.now()).toLocaleDateString() + " "}
              </Text>
              . Guests are allowed to view this map, but cannot submit reports
              to the system.
            </Text>
            {/* MAIN MAP VIEW */}
            {loading ? (
              <LoadingMapPanel />
            ) : (
              <>
                <View style={{ flex: 1, width: "100%", height: height * 0.95 }}>
                  <MapView
                    style={{
                      flex: 1,
                      backgroundColor: "#11162B",
                      width: "100%",
                    }}
                    initialRegion={{
                      latitude: location?.latitude || 0,
                      longitude: location?.longitude || 0,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <UrlTile
                      urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maximumZ={19}
                      tileSize={256}
                    />

                    {/* Marker Rendering */}
                    {dailyCombinedReports.map(
                      ([preverified, verified], index) => {
                        const coordinatesFloat = {
                          latitude:
                            typeof preverified.PR_latitude == "string"
                              ? parseFloat(preverified.PR_latitude)
                              : preverified.PR_latitude,
                          longitude:
                            typeof preverified.PR_longitude == "string"
                              ? parseFloat(preverified.PR_longitude)
                              : preverified.PR_longitude,
                        };

                        if (verified) {
                          return (
                            <Marker
                              key={`marker-ID#${preverified.PR_report_id}-postverified`}
                              coordinate={coordinatesFloat}
                              onPress={() => {
                                setIsSelectedModalVisible(true);
                                setSelectedReport([preverified, verified]);
                              }}
                            >
                              <PulsatingMarker>
                                <View
                                  style={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: "#2F855A",
                                    padding: 2,
                                    borderRadius: 20,
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <FontAwesome
                                    name="exclamation"
                                    color="#FFFFFF"
                                  />
                                </View>
                              </PulsatingMarker>
                            </Marker>
                          );
                        }
                        return (
                          <Marker
                            key={`marker-ID#${preverified.PR_report_id}-preverified`}
                            coordinate={coordinatesFloat}
                            onPress={() => {
                              setIsSelectedModalVisible(true);
                              setSelectedReport([preverified, null]);
                            }}
                          >
                            <PulsatingMarker>
                              <View
                                style={{
                                  width: 35,
                                  height: 35,
                                  backgroundColor: "#C53030",
                                  padding: 2,
                                  borderRadius: 20,
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <FontAwesome
                                  name="question"
                                  size={24}
                                  color="#FFFFFF"
                                />
                              </View>
                            </PulsatingMarker>
                          </Marker>
                        );
                      }
                    )}
                  </MapView>

                  {/* Map Buttons */}
                  <View
                    pointerEvents="box-none"
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      right: 8,
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      zIndex: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        width: height * 0.05,
                        height: height * 0.05,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        marginRight: 8,
                      }}
                      onPress={handleRefresh}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? (
                        <ActivityIndicator size="small" color="#F97316" />
                      ) : (
                        <FontAwesome
                          name="refresh"
                          size={height * 0.04}
                          color="#F97316"
                          style={{
                            shadowColor: "#000",
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 8,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        width: height * 0.05,
                        height: height * 0.05,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        marginRight: 8,
                      }}
                      onPress={() =>
                        Alert.alert("Info", "Map info button pressed")
                      }
                    >
                      <FontAwesome
                        name="info"
                        size={height * 0.04}
                        color="#F97316"
                        style={{
                          shadowColor: "#000",
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 8,
                        }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        width: height * 0.05,
                        height: height * 0.05,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                      }}
                      onPress={() =>
                        Alert.alert("Settings", "Map settings button pressed")
                      }
                    >
                      <FontAwesome
                        name="gear"
                        size={height * 0.04}
                        color="#F97316"
                        style={{
                          shadowColor: "#000",
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 8,
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
          {/* Role Information */}
          <View
            style={{
              flex: 1,
              padding: width * 0.05,
              marginBottom: height * 0.05,
            }}
          >
            <Text
              style={{
                color: "#F97316",
                fontSize: width * 0.045,
                fontWeight: "bold",
              }}
            >
              <FontAwesome name="users" size={width * 0.045} />
              {"  "}Roles & Permissions
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: width * 0.03,
                lineHeight: 24,
                marginTop: width * 0.03,
              }}
            >
              There are different roles within the Apollo application, each with
              their own permissions and restrictions. Below is the full list and
              description of each role:
            </Text>

            {/* Grid Header */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderBottomWidth: 1,
                  borderBottomColor: "#F97316",
                  paddingBottom: height * 0.01,
                  marginBottom: height * 0.015,
                  gap: width * 0.07,
                  marginTop: height * 0.02,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: width * 0.035,
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  Name
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: width * 0.035,
                    fontWeight: "bold",
                    flex: 2,
                  }}
                >
                  Role
                </Text>
              </View>
            </View>
            {/* Grid Content */}
            {rolesData.map((role, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: height * 0.02,

                  gap: width * 0.07,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: width * 0.03,
                    flex: 1,
                  }}
                >
                  {renderRoleBadge(role.role.toLowerCase())}
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontSize: width * 0.03,
                    flex: 2,
                  }}
                >
                  {role.description}
                </Text>
              </View>
            ))}
          </View>
          {/* Additional contact information */}
          <View
            style={{
              flex: 1,
              height: height * 0.95,
              padding: width * 0.05,
              marginBottom: height * 0.05,
              borderRadius: 16,
              marginVertical: 10,
              justifyContent: "flex-start",
            }}
          >
            <Text
              style={{
                color: "#F97316",
                fontSize: width * 0.045,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              <FontAwesome name="fire-extinguisher" size={width * 0.045} />{" "}
              Contact Information
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: width * 0.03,
                lineHeight: 24,
              }}
            >
              In the case that the Apollo system is not working properly, there
              are other alternate ways to contact the Daang Bakal Fire Station
              with the information displayed below. Additionally, links
              regarding the Apollo system can be seen below.
            </Text>
            {/* Contact Info Table */}
            <View
              style={{
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 0,
                marginBottom: 16,
              }}
            >
              {/* Address */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#11162B",
                }}
              >
                <Text
                  style={{
                    color: "#F97316",
                    fontWeight: "bold",
                    fontSize: width * 0.034,
                    flex: 1,
                  }}
                >
                  Address
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: width * 0.032,
                    flex: 2,
                    textAlign: "right",
                  }}
                >
                  552 J Fabella St, Mandaluyong City, 1550 Metro Manila
                </Text>
              </View>
              {/* Contact */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#11162B",
                }}
              >
                <Text
                  style={{
                    color: "#F97316",
                    fontWeight: "bold",
                    fontSize: width * 0.034,
                    flex: 1,
                  }}
                >
                  Contact
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: width * 0.032,
                    flex: 2,
                    textAlign: "right",
                  }}
                >
                  (02) 1234-5678
                </Text>
              </View>
              {/* Email */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#11162B",
                }}
              >
                <Text
                  style={{
                    color: "#F97316",
                    fontWeight: "bold",
                    fontSize: width * 0.034,
                    flex: 1,
                  }}
                >
                  Email
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: width * 0.032,
                    flex: 2,
                    textAlign: "right",
                  }}
                >
                  daangbakalfirestation@email.com
                </Text>
              </View>
              {/* Facebook */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#11162B",
                }}
              >
                <Text
                  style={{
                    color: "#F97316",
                    fontWeight: "bold",
                    fontSize: width * 0.034,
                    flex: 1,
                  }}
                >
                  Facebook
                </Text>
                <Text
                  style={{
                    color: "#3b82f6",
                    fontSize: width * 0.032,
                    flex: 2,
                    textAlign: "right",
                    textDecorationLine: "underline",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    Linking.openURL(
                      "https://www.facebook.com/pages/Daang-Bakal-Fire-Rescue-Volunteer-Fire-House-09/288006868691109/"
                    );
                  }}
                >
                  Official Daang Bakal Fire Rescue Facebook Page{" "}
                  <FontAwesome
                    name="external-link"
                    size={width * 0.032}
                    color="#3b82f6"
                  />
                </Text>
              </View>
              {/* Apollo Website */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#11162B",
                }}
              >
                <Text
                  style={{
                    color: "#F97316",
                    fontWeight: "bold",
                    fontSize: width * 0.034,
                    flex: 1,
                  }}
                >
                  Apollo Website
                </Text>
                <Text
                  style={{
                    color: "#3b82f6",
                    fontSize: width * 0.032,
                    flex: 2,
                    textAlign: "right",
                    textDecorationLine: "underline",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={() => {
                    Linking.openURL("https://apollo-website.com");
                  }}
                >
                  Official Apollo Website{" "}
                  <FontAwesome
                    name="external-link"
                    size={width * 0.032}
                    color="#3b82f6"
                  />
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <SelectedReportModal
        visible={isSelectedModalVisible}
        onClose={closeSelectedReportModal}
        selectedReport={selectedReport}
      />
    </>
  );
};

export default GuestLogin;
