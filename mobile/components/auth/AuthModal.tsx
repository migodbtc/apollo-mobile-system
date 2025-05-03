import { CustomAlertProps } from "@/constants/interfaces/components";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, View, TouchableOpacity, Dimensions } from "react-native";

const AuthModal: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onClose,
}) => {
  const { width, height } = Dimensions.get("window");

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            backgroundColor: "#1E293B",
            padding: width * 0.06,
            borderRadius: 15,
            width: width * 0.8,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          {/* Title */}
          <Text
            style={{
              fontSize: width * 0.045,
              fontWeight: "bold",
              color: "#f97316",
              textAlign: "center",
              marginBottom: height * 0.02,
            }}
          >
            <FontAwesome
              name="exclamation-circle"
              size={width * 0.05}
              color="#f97316"
            />
            {"  "}
            {title}
          </Text>

          {/* Message */}
          <Text
            style={{
              fontSize: width * 0.035,
              color: "#E2E8F0",
              textAlign: "center",
              marginBottom: height * 0.03,
            }}
          >
            {message}
          </Text>

          {/* Close Button */}
          {title !== "Login Successful!" &&
            title !== "Registration Successful!" && (
              <TouchableOpacity
                style={{
                  backgroundColor: "#f97316",
                  borderRadius: 10,
                  alignItems: "center",
                  paddingVertical: height * 0.012,
                  marginBottom: height * 0.01,
                }}
                onPress={onClose}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#FFF",
                    fontSize: width * 0.04,
                  }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </View>
    </Modal>
  );
};

export default AuthModal;
