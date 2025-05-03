import "./global.css";
import MainLayout from "./(main)/_layout";
import { SessionProvider } from "@/constants/contexts/SessionContext";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <MainLayout />
    </SessionProvider>
  );
}
