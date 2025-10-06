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
          router.replace("/login");
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
      {/* Form placed directly on the screen background (no card) */}
      <View
        style={{
          width: "100%",
          paddingHorizontal: width * 0.06,
          paddingVertical: height * 0.02,
        }}
      >
        <Text
          style={{
            fontSize: width * 0.05,
            fontWeight: "bold",
            textAlign: "center",
            color: "#c2410c",
            marginTop: height * 0.01,
            marginBottom: height * 0.02, // increased spacing below title
          }}
        >
          <FontAwesome name="fire" size={width * 0.05} />
          {"  "}Sign Up
        </Text>

        {/* Help alert: darker background with a light border; icon inside the alert */}
        <View
          style={{
            width: "100%",
            backgroundColor: "#073b36", // slightly lighter background
            borderRadius: 10,
            paddingVertical: height * 0.012,
            paddingHorizontal: width * 0.04,
            marginTop: height * 0.01, // small gap from title
            marginBottom: height * 0.025, // slightly larger gap after alert
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#2e6b67", // slightly lighter border
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
            }}
          >
            <View style={{ marginRight: 10 }}>
              <FontAwesome
                name="info-circle"
                size={width * 0.038}
                color="#2e6b67"
              />
            </View>
            <Text
              style={{
                color: "#78c6bf",
                textAlign: "left",
                fontSize: width * 0.032,
                flex: 1,
              }}
            >
              Tip: Use a valid email and a secure password. Passwords must
              match.
            </Text>
          </View>
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: width * 0.012,
            paddingHorizontal: width * 0.04,
            marginBottom: height * 0.025, // increased vertical spacing between inputs
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
            style={{ flex: 1, fontSize: width * 0.034, color: "#c2410c" }}
            placeholder="Username"
            placeholderTextColor="#888"
            onChangeText={setUsername}
          />
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: width * 0.012,
            paddingHorizontal: width * 0.04,
            marginBottom: height * 0.025, // increased vertical spacing between inputs
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
            style={{ flex: 1, fontSize: width * 0.034, color: "#c2410c" }}
            placeholder="Email Address"
            placeholderTextColor="#888"
            onChangeText={setEmailAddress}
          />
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: width * 0.012,
            paddingHorizontal: width * 0.04,
            marginBottom: height * 0.025, // increased vertical spacing between inputs
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
            style={{ flex: 1, fontSize: width * 0.034, color: "#c2410c" }}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            onChangeText={setPassword}
          />
        </View>

        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#00000000",
            borderRadius: 12,
            paddingVertical: width * 0.012,
            paddingHorizontal: width * 0.04,
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
            style={{ flex: 1, fontSize: width * 0.034, color: "#c2410c" }}
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
            marginBottom: height * 0.012,
            marginTop: height * 0.03, // increased spacing above button
            paddingVertical: height * 0.012,
            width: "100%",
            alignSelf: "center",
            justifyContent: "center",
          }}
          onPress={handleRegistration}
        >
          <Text
            style={{
              color: "white",
              fontWeight: "bold",
              fontSize: width * 0.045,
            }}
          >
            SIGN-UP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/login")}
          style={{ marginTop: height * 0.02 }}
        >
          <Text
            style={{
              color: "#c2410c",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: width * 0.034,
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
