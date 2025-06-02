import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import LoadingScreen from "@/components/auth/LoadingScreen";
import { useSession } from "@/constants/contexts/SessionContext";
import { SafeAreaView } from "react-native-safe-area-context";

const MainLayout = () => {
  const { sessionData } = useSession(); // Access session data
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // useEffect code to say "layout has been mounted" on the first
  // complete rendering of the layout
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // useEffect code that waits for the layout to be mounted so that
  // the page automatically loads one of two routes based on the
  // session data present
  useEffect(() => {
    if (isMounted) {
      if (sessionData === null) {
        router.replace("/login");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [isMounted, sessionData, router]);

  if (!isMounted) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(dash)" />
    </Stack>
  );
};

export default MainLayout;
