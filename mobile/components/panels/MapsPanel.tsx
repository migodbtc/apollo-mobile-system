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
import MapView, {
  Callout,
  Circle,
  Marker,
  Overlay,
  UrlTile,
} from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import LoadingMapPanel from "../dash/LoadingMapScreen";
import {
  PostverifiedReport,
  PreverifiedReport,
} from "@/constants/interfaces/database";
import SERVER_LINK from "@/constants/netvar";
import PulsatingMarker from "../dash/PulsatingMarker";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";

const { width, height } = Dimensions.get("window");

const MapsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [showPreverified, setShowPreverified] = useState(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
      {loading ? (
        <LoadingMapPanel />
      ) : (
        <>
          <View style={{ flex: 1, width: "100%", height: height * 0.95 }}>
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
                urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maximumZ={19}
                tileSize={256}
              />

              {/* Marker Rendering */}
              {dailyCombinedReports.map(([preverified, verified], index) => {
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
                      onPress={() =>
                        Alert.alert(
                          "You pressed a marker for a verified report!"
                        )
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
                    coordinate={coordinatesFloat}
                    onPress={() =>
                      Alert.alert(
                        "You pressed a marker for a unverified report!"
                      )
                    }
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
              })}
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
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
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
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                onPress={() => Alert.alert("Info", "Map info button pressed")}
              >
                <FontAwesome name="info" size={height * 0.04} color="#F97316" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: height * 0.05,
                  height: height * 0.05,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                onPress={() =>
                  Alert.alert("Settings", "Map settings button pressed")
                }
              >
                <FontAwesome name="gear" size={height * 0.04} color="#F97316" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </>
  );
};

export default MapsPanel;
