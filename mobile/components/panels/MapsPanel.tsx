import {
  View,
  Text,
  Alert,
  Dimensions,
  ActivityIndicator,
  Touchable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import MapView, { Callout, Marker, Overlay, UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import LoadingMapPanel from "../dash/LoadingMapScreen";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import SERVER_LINK from "@/constants/netvar";
import PulsatingMarker from "./PulsatingMarker";

const { width, height } = Dimensions.get("window");

const MapsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [showPreverified, setShowPreverified] = useState(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [preverifiedReports, setPreverifiedReports] = useState<
    PreverifiedReport[]
  >([]);
  const [verifiedReports, setVerifiedReports] = useState<PostverifiedReport[]>(
    []
  );

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ### PERMISSIONS: Get necessary permissions to access
  // mobile device location when the component is mounted.
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required.");
          setLoading(false);
          return;
        }

        // Fetch user location
        const userLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });

        setLoading(false);

        // Fetch reports
        const [preverified, postverified] = await Promise.all([
          fetchUnverifiedReports(),
          fetchVerifiedReports(),
        ]);

        setPreverifiedReports(preverified);
        setVerifiedReports(postverified);
      } catch (error) {
        console.error("Error in fetching location or reports:", error);
      }
    })();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);

      // Fetch fresh reports
      const [preverified, postverified] = await Promise.all([
        fetchUnverifiedReports(),
        fetchVerifiedReports(),
      ]);

      setPreverifiedReports(preverified);
      setVerifiedReports(postverified);

      // This will trigger the combinedReports memo to recalculate
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error refreshing reports:", error);
      Alert.alert("Refresh Error", "Failed to refresh reports");
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchUnverifiedReports = async (): Promise<PreverifiedReport[]> => {
    try {
      const response = await fetch(`${SERVER_LINK}/reports/preverified/all`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.map((report: any) => ({
        PR_report_id: report["PR_report_id"],
        PR_user_id: report["PR_user_id"],
        PR_image_url: report["PR_image_url"],
        PR_video_url: report["PR_video_url"],
        PR_latitude: parseFloat(report["PR_latitude"]),
        PR_longitude: parseFloat(report["PR_longitude"]),
        PR_address: report["PR_address"],
        PR_timestamp: new Date(report["PR_timestamp"]),
        PR_verified: report["PR_verified"] === 1,
        PR_report_status: report["PR_report_status"] as
          | "pending"
          | "verified"
          | "false_alarm"
          | "resolved",
      }));
    } catch (error) {
      console.error("Failed to fetch unverified reports:", error);
      throw error; // Re-throw to be caught by the main error handler
    }
  };

  const fetchVerifiedReports = async (): Promise<PostverifiedReport[]> => {
    const response = await fetch(`${SERVER_LINK}/reports/postverified/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Failed to fetch verified reports");

    const data = await response.json();

    return data.map((report: any) => ({
      VR_verification_id: report["VR_verification_id"],
      VR_report_id: report["VR_report_id"],
      VR_confidence_score: parseFloat(report["VR_confidence_score"]),
      VR_detected: report["VR_detected"] === 1,
      VR_verification_timestamp: new Date(report["VR_verification_timestamp"]),
      VR_severity_level: report["VR_severity_level"] as
        | "low"
        | "moderate"
        | "high"
        | "critical",
      VR_spread_potential: report["VR_spread_potential"] as
        | "low"
        | "moderate"
        | "high",
      VR_fire_type: report["VR_fire_type"],
    }));
  };

  const combinedReports = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);

    const filteredPreverified = preverifiedReports.filter((preverified) => {
      const prDate = new Date(preverified.PR_timestamp)
        .toISOString()
        .slice(0, 10);
      const isToday = prDate === today;
      return isToday;
    });

    const result = filteredPreverified.map((preverified) => {
      const prDate = new Date(preverified.PR_timestamp)
        .toISOString()
        .slice(0, 10);

      const verified = verifiedReports.find((v) => {
        const vrDate = new Date(v.VR_verification_timestamp)
          .toISOString()
          .slice(0, 10);
        const idMatch = v.VR_report_id === preverified.PR_report_id;
        const dateMatch = vrDate === prDate;

        return idMatch && dateMatch;
      });

      return [preverified, verified ?? null] as [
        PreverifiedReport,
        PostverifiedReport | null
      ];
    });

    return result;
  }, [preverifiedReports, verifiedReports, showPreverified]);

  // Load special waiting screen when the map is being rendered
  if (loading) {
    return <LoadingMapPanel />;
  }

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#11162B",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <MapView
        style={{ flex: 1, backgroundColor: "#11162B", width: "100%" }}
        initialRegion={{
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/10/511/511.png"
          maximumZ={19}
          tileSize={256}
        />

        <View key={refreshKey}>
          {combinedReports.map(([preverified, verified], index) => {
            if (verified) {
              return (
                <Marker
                  key={`marker-ID#${preverified.PR_report_id}-postverified`}
                  coordinate={{
                    latitude: preverified.PR_latitude,
                    longitude: preverified.PR_longitude,
                  }}
                  onPress={() =>
                    Alert.alert("You pressed a marker for a verified report!")
                  }
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
                      <FontAwesome name="exclamation" color="#FFFFFF" />
                    </View>
                  </PulsatingMarker>
                </Marker>
              );
            }
            return (
              <Marker
                key={`marker-ID#${preverified.PR_report_id}-preverified`}
                coordinate={{
                  latitude: preverified.PR_latitude,
                  longitude: preverified.PR_longitude,
                }}
                onPress={() =>
                  Alert.alert("You pressed a marker for a unverified report!")
                }
              >
                <PulsatingMarker>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: "#C53030",
                      padding: 2,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FontAwesome name="question" size={24} color="#FFFFFF" />
                  </View>
                </PulsatingMarker>
              </Marker>
            );
          })}
        </View>
      </MapView>
      <View
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          width: height * 0.05,
          height: height * 0.05,
          alignContent: "center",
          justifyContent: "center",
          opacity: 0.4,
        }}
      >
        <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <FontAwesome name="refresh" size={height * 0.04} />
          )}
        </TouchableOpacity>
      </View>
      <View
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 1,
          width: height * 0.05,
          height: height * 0.05,
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.4,
        }}
      >
        <TouchableOpacity
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="info" size={height * 0.04} />
        </TouchableOpacity>
      </View>
      <View
        style={{
          position: "absolute",
          top: 8 + 4 + height * 0.05, // 4 is the margin
          left: 8,
          zIndex: 1,
          width: height * 0.05,
          height: height * 0.05,
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.4,
        }}
      >
        <TouchableOpacity
          style={{
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="gear" size={height * 0.04} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapsPanel;
