import LoadingScreen from "@/components/auth/LoadingScreen";
import { useSession } from "@/constants/contexts/SessionContext";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native";

export default function AuthLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_bottom",
          animationDuration: 1000,
        }}
      >
        <Stack.Screen name="login" options={{ title: "Login" }} />
        <Stack.Screen name="register" options={{ title: "Register" }} />
      </Stack>
    </SafeAreaView>
  );
}



