import {
  View,
  Text,
  Alert,
  Dimensions,
  ActivityIndicator,
  Touchable,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import MapView, { Callout, Marker, Overlay, UrlTile } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import LoadingMapPanel from "../dash/LoadingMapScreen";

const { width, height } = Dimensions.get("window");

const MapsPanel = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Before proceeding, ask for the location permission
      // using an async function to request the permission of the mobile
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        setLoading(false);
        return;
      }

      // If the permission is granted, get the current location of
      // the mobile device and set the location state accordingly
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
      setLoading(false);
    })();
  }, []);

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

        {/* Custom Marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            onPress={() => Alert.alert("Marker Pressed")}
          >
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
          </Marker>
        )}

        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude + 0.0005,
              longitude: location.longitude + 0.00115,
            }}
            onPress={() => Alert.alert("Marker Pressed")}
          >
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
              <FontAwesome name="exclamation" size={24} color="#FFFFFF" />
            </View>
          </Marker>
        )}
      </MapView>
    </View>
  );
};

export default MapsPanel;
