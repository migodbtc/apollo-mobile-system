import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSession } from "@/constants/contexts/SessionContext";
import AuthModal from "./AuthModal";
import { SERVER_LINK } from "@/constants/netvar";

const LoginBox: React.FC = () => {
  // GLOBAL SESSION VARIABLE (CONTEXT)
  const { sessionData, setSessionData } = useSession();

  // POP UP MODAL STATE VARIABLES
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });

  // COMPONENT STATE VARIABLES
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const router = useRouter();

  const { width, height } = Dimensions.get("window");

  const handleLogin = async () => {
    if (!username || !password) {
      setAlertData({
        title: "Missing Fields",
        message: "Make sure all fields are filled in before proceeding!",
      });
      setAlertVisible(true);
      return;
    }

    const payload = {
      UA_username: username,
      UA_password: password,
      UA_remember_me: rememberMe,
    };

    try {
      const response = await fetch(`${SERVER_LINK}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const {
          UA_user_id,
          UA_username,
          UA_user_role,
          UA_created_at,
          UA_last_name,
          UA_first_name,
          UA_middle_name,
          UA_suffix,
          UA_email_address,
          UA_phone_number,
          UA_reputation_score,
          UA_id_picture_front,
          UA_id_picture_back,
        } = data.user_data;

        setAlertData({
          title: "Login Successful!",
          message: `Welcome to Apollo, @${UA_username}! Redirecting...`,
        });
        setAlertVisible(true);

        setTimeout(() => {
          setSessionData({
            UA_user_id,
            UA_username,
            UA_user_role,
            UA_created_at,
            UA_last_name,
            UA_first_name,
            UA_middle_name,
            UA_suffix,
            UA_email_address,
            UA_phone_number,
            UA_reputation_score,
            UA_id_picture_front,
            UA_id_picture_back,
          });
        }, 3000);
      } else {
        handleLoginError("Login authentication failed.");
      }
    } catch (e) {
      console.error(e);
      handleLoginError(
        "Could not connect to the server. Please try again later."
      );
    }
  };

  const handleLoginError = (message: string) => {
    setAlertData({
      title: "Login Failed",
      message,
    });
    setSessionData(null);
    setAlertVisible(true);
  };

  return (
    <>
      <View
        style={{
          width: "75%",
          backgroundColor: "#11162B",
          paddingHorizontal: width * 0.08,
          paddingTop: height * 0.035,
          paddingBottom: height * 0.06,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 5,
          marginBottom: height * 0.05,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.05,
            fontWeight: "bold",
            textAlign: "center",
            color: "#c2410c",
            marginTop: height * 0.015,
            marginBottom: height * 0.03,
          }}
        >
          <FontAwesome name="fire" size={width * 0.05} />
          {"  "}APOLLO LOGIN
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: 4,
            paddingHorizontal: 16,
            marginBottom: height * 0.02,
            backgroundColor: "#1E293B",
          }}
        >
          <FontAwesome
            name="user"
            size={20}
            color="#c2410c"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={{ flex: 1, fontSize: width * 0.03, color: "#c2410c" }}
            placeholder="Username"
            placeholderTextColor="#888"
            onChangeText={setUsername}
            value={username}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: 4,
            paddingHorizontal: 16,
            marginBottom: height * 0.02,
            backgroundColor: "#1E293B",
          }}
        >
          <FontAwesome
            name="lock"
            size={20}
            color="#c2410c"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={{ flex: 1, fontSize: width * 0.03, color: "#c2410c" }}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
        </View>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: width * 0.01,
            marginBottom: height * 0.03,
          }}
          onPress={() => setRememberMe(!rememberMe)}
        >
          <FontAwesome
            name={rememberMe ? "check-square" : "square-o"}
            size={width * 0.04}
            color="#c2410c"
            style={{ marginRight: width * 0.04 }}
          />
          <Text
            style={{
              fontWeight: "bold",
              color: "#c2410c",
              fontSize: width * 0.03,
            }}
          >
            REMEMBER ME
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#f97316",
            borderRadius: 12,
            alignItems: "center",
            marginHorizontal: width * 0.005,
            paddingVertical: height * 0.01,
            marginBottom: height * 0.03,
          }}
          onPress={handleLogin}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: width * 0.04,
            }}
          >
            LOGIN
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register")}
          style={{
            marginBottom: 5,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: "#c2410c",
              textAlign: "left",
              fontWeight: "bold",
              fontSize: width * 0.03,
              width: "100%",
            }}
          >
            Don't have an account? Sign up!
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          // Put onPress event when forgot password feature is implemented
          style={{
            marginBottom: 5,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: "#c2410c",
              textAlign: "left",
              fontWeight: "bold",
              fontSize: width * 0.03,
              width: "100%",
            }}
          >
            Forgot your password?
          </Text>
        </TouchableOpacity>
      </View>
      <AuthModal
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        onClose={() => {
          setAlertVisible(false);
        }}
      />
    </>
  );
};

export default LoginBox;
