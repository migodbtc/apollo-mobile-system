import "./global.css";
import MainLayout from "./(main)/_layout";
import { SessionProvider } from "@/constants/contexts/SessionContext";
import { Alert, StatusBar } from "react-native";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AdminSQLProvider } from "@/constants/contexts/AdminSQLContext";
import SERVER_LINK from "@/constants/netvar";
import * as Notifications from "expo-notifications";
import EventSource from "react-native-sse";

// NOTIFICATION SETUP
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  // NOTIFICATION PERMISSIONS HOOK
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission not granted for notifications");
      }
    };
    requestPermissions();
  }, []);

  // NOTIFICATION STREAM HOOK FROM FLASK API
  useEffect(() => {
    const eventSource = new EventSource(`${SERVER_LINK}/notifications/stream`);

    eventSource.addEventListener("message", async (event) => {
      console.log("New message event:", event.data);

      if (!event.data) {
        console.warn("Received empty event data");
        return;
      }

      const data = JSON.parse(event.data);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
        },
        trigger: null,
      });
    });

    return () => eventSource.close();
  }, []);

  return (
    <AdminSQLProvider serverUrl={SERVER_LINK}>
      <SessionProvider>
        <SafeAreaProvider style={{ backgroundColor: "#11162B" }}>
          <SafeAreaView style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="#11162B" />
            <MainLayout />
          </SafeAreaView>
        </SafeAreaProvider>
      </SessionProvider>
    </AdminSQLProvider>
  );
}
