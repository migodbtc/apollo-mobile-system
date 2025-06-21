import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AuthModal from "./AuthModal";
import { useSession } from "@/constants/contexts/SessionContext";
import { SERVER_LINK } from "@/constants/netvar";

const RegisterBox: React.FC = () => {
  // EXPO STATE VARIABLES
  const router = useRouter();
  const { width, height } = Dimensions.get("window");

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

  // FORM DETAILS STATE VARIABLES
  const [username, setUsername] = useState<string>("migoadmin1");
  const [emailAddress, setEmailAddress] = useState<string>(
    "mjdmbunda@donbosco.edu.ph"
  );
  const [password, setPassword] = useState<string>("migomigo1");
  const [confirmPassword, setConfirmPassword] = useState<string>("migomigo1");

  // COMPONENT FUNCTIONS
  const handleRegistration = async () => {
    if (!username || !emailAddress || !password || !confirmPassword) {
      handleRegisterError(
        "Make sure all fields are filled in before proceeding!"
      );
      return;
    }

    if (password !== confirmPassword) {
      handleRegisterError("The passwords do not match. Please try again.");
      return;
    }

    const payload = {
      UA_username: username,
      UA_password: password,
      UA_email_address: emailAddress,
    };

    try {
      const response = await fetch(`${SERVER_LINK}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertData({
          title: "Registration Successful!",
          message: `Welcome to Apollo, @${username}! Your account has been created.`,
        });
        setAlertVisible(true);

        setTimeout(() => {
          setAlertVisible(false);
          router.push("/login");
        }, 3000);
      } else {
        handleRegisterError(
          data.error || "Something went wrong. Please try again."
        );
      }
    } catch (e) {
      handleRegisterError(
        "Could not connect to the server. Please try again later."
      );
    }
  };

  const handleRegisterError = (message: string) => {
    setAlertData({
      title: "Registration Failed",
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
          paddingVertical: height * 0.035,
          borderRadius: 10,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 5,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.04,
            fontWeight: "bold",
            textAlign: "center",
            color: "#c2410c",
            marginTop: height * 0.015,
            marginBottom: height * 0.03,
          }}
        >
          <FontAwesome name="fire" size={width * 0.04} />
          {"  "}APOLLO SIGN-UP FORM
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: width * 0.01,
            paddingHorizontal: width * 0.03,
            marginBottom: height * 0.02,
            backgroundColor: "#1E293B",
          }}
        >
          <FontAwesome
            name="user"
            size={width * 0.04}
            color="#c2410c"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={{ flex: 1, fontSize: width * 0.03, color: "#c2410c" }}
            placeholder="Username"
            placeholderTextColor="#888"
            onChangeText={setUsername}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: width * 0.01,
            paddingHorizontal: width * 0.03,
            marginBottom: height * 0.02,
            backgroundColor: "#1E293B",
          }}
        >
          <FontAwesome
            name="envelope"
            size={width * 0.04}
            color="#c2410c"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={{ flex: 1, fontSize: width * 0.03, color: "#c2410c" }}
            placeholder="Email Address"
            placeholderTextColor="#888"
            onChangeText={setEmailAddress}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: width * 0.01,
            paddingHorizontal: width * 0.03,
            marginBottom: height * 0.02,
            backgroundColor: "#1E293B",
          }}
        >
          <FontAwesome
            name="lock"
            size={width * 0.04}
            color="#c2410c"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={{ flex: 1, fontSize: width * 0.03, color: "#c2410c" }}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: width * 0.01,
            paddingHorizontal: width * 0.03,
            marginBottom: height * 0.02,
            backgroundColor: "#1E293B",
          }}
        >
          <FontAwesome
            name="lock"
            size={width * 0.04}
            color="#c2410c"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={{ flex: 1, fontSize: width * 0.03, color: "#c2410c" }}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            secureTextEntry
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: "#f97316",
            borderRadius: 12,
            alignItems: "center",
            marginBottom: width * 0.005,
            marginTop: width * 0.04,
            paddingVertical: height * 0.01,
          }}
          onPress={handleRegistration}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: width * 0.04,
            }}
          >
            SIGN-UP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={{ marginTop: 15 }}
        >
          <Text
            style={{
              color: "#c2410c",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: width * 0.03,
            }}
          >
            Return to Login Page?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={alertVisible}
        title={alertData.title}
        message={alertData.message}
        onClose={() => setAlertVisible(false)}
      />
    </>
  );
};

export default RegisterBox;
