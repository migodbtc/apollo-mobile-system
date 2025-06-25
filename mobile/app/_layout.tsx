import "./global.css";
import MainLayout from "./(main)/_layout";
import { SessionProvider } from "@/constants/contexts/SessionContext";
import { StatusBar } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AdminSQLProvider } from "@/constants/contexts/AdminSQLContext";
import SERVER_LINK from "@/constants/netvar";

export default function RootLayout() {
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
