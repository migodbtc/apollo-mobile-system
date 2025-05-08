import { View, Text, ScrollView, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import SERVER_LINK from "@/constants/netvar";
import { UserAccount } from "@/constants/interfaces/database";

const { width, height } = Dimensions.get("window");

const TeamsPanel = () => {
  const [responders, setResponders] = useState<UserAccount[]>([]);

  useEffect(() => {
    const fetchResponders = async () => {
      try {
        const response = await fetch(`${SERVER_LINK}/user/get/all/responders`);
        const data: UserAccount[] = await response.json();
        setResponders(data);
      } catch (err) {
        console.error("Failed to fetch responders", err);
      }
    };

    fetchResponders();
  }, []);

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: width * 0.1,
        paddingTop: height * 0.015,
      }}
    >
      {/* Section Title */}
      <Text
        style={{
          color: "#F97316",
          fontSize: width * 0.045,
          fontWeight: "bold",
          marginTop: height * 0.02,
        }}
      >
        <FontAwesome name="code" size={width * 0.045} />
        {"  "}Current Responders
      </Text>

      <Text
        style={{
          color: "#9CA3AF",
          fontSize: width * 0.03,
          lineHeight: 20,
          marginTop: 16,
          textAlign: "left",
          marginBottom: height * 0.04,
        }}
      >
        We appreciate your contribution to the ApolloExpo system. Your feedback
        is valuable to us, and we're committed to making improvements for a
        better experience. Reach out anytime with suggestions or questions.
      </Text>

      {/* Table Header */}
      <View style={{ marginBottom: 16 }}>
        {/* Responders List */}
        {responders.map((user, index) => {
          const fullName =
            [
              user.UA_first_name,
              user.UA_middle_name,
              user.UA_last_name,
              user.UA_suffix,
            ]
              .filter(Boolean)
              .join(" ") || `@${user.UA_username}`;

          return (
            <View
              key={index}
              style={{
                marginBottom: height * 0.025,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <Text
                  style={{
                    color: "#FB923C",
                    fontSize: width * 0.032,
                    fontWeight: "600",
                    flex: 1,
                  }}
                >
                  {fullName.toUpperCase()}
                </Text>
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: width * 0.03,
                    textAlign: "right",
                  }}
                >
                  Joined on {new Date(user.UA_created_at).toLocaleDateString()}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: width * 0.028,
                    fontStyle: "italic",
                    flex: 1,
                  }}
                >
                  ({user.UA_email_address || "N/A"})
                </Text>

                {typeof user.UA_reputation_score === "number" &&
                  !isNaN(user.UA_reputation_score) && (
                    <Text
                      style={{
                        color: "#4ade80",
                        fontSize: width * 0.03,
                        fontWeight: "bold",
                        textAlign: "right",
                      }}
                    >
                      {user.UA_reputation_score} RS
                    </Text>
                  )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default TeamsPanel;
