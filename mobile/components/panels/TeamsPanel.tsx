import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import SERVER_LINK from "@/constants/netvar";
import { UserAccount } from "@/constants/interfaces/database";

const { width, height } = Dimensions.get("window");

import { UserRole } from "@/constants/interfaces/database";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";

const TeamsPanel = () => {
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { userAccounts } = useAdminSQL();

  const openUserModal = (user: UserAccount) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };
  const closeUserModal = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  return (
    <>
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
          We appreciate your contribution to the ApolloExpo system. Your
          feedback is valuable to us, and we're committed to making improvements
          for a better experience. Reach out anytime with suggestions or
          questions.
        </Text>

        {/* Table Header */}
        <View style={{ marginBottom: 16 }}>
          {/* Responders List */}
          {userAccounts
            .filter((user) => user.UA_user_role === "responder")
            .map((user, index) => {
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
                <TouchableOpacity
                  key={index}
                  style={{ marginBottom: height * 0.025 }}
                  activeOpacity={0.85}
                  onPress={() => openUserModal(user)}
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
                      Joined on{" "}
                      {new Date(user.UA_created_at).toLocaleDateString()}
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
                </TouchableOpacity>
              );
            })}
        </View>
        {/* User Details Modal */}
      </ScrollView>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeUserModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedUser ? (
              <>
                <Text style={styles.modalTitle}>
                  <FontAwesome
                    name="user"
                    size={width * 0.055}
                    color="#f97316"
                  />
                  {"  "}Responder Details
                </Text>
                {/* Account Info */}
                <View style={styles.sectionHeaderRow}>
                  <FontAwesome
                    name="id-card"
                    size={width * 0.045}
                    color="#94A3B8"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.sectionHeader}>Account Info</Text>
                </View>
                {selectedUser.UA_user_id !== undefined &&
                  selectedUser.UA_user_id !== null && (
                    <View style={styles.twoColumnContainer}>
                      <View style={styles.labelColumn}>
                        <Text style={styles.sectionTitle}>User ID</Text>
                      </View>
                      <View style={styles.contentColumn}>
                        <Text style={styles.sectionText}>
                          {selectedUser.UA_user_id}
                        </Text>
                      </View>
                    </View>
                  )}
                {selectedUser.UA_username && (
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Username</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedUser.UA_username}
                      </Text>
                    </View>
                  </View>
                )}
                {selectedUser.UA_user_role && (
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Role</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedUser.UA_user_role}
                      </Text>
                    </View>
                  </View>
                )}
                {[
                  selectedUser.UA_first_name,
                  selectedUser.UA_middle_name,
                  selectedUser.UA_last_name,
                  selectedUser.UA_suffix,
                ]
                  .filter(Boolean)
                  .join(" ") && (
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Full Name</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {[
                          selectedUser.UA_first_name,
                          selectedUser.UA_middle_name,
                          selectedUser.UA_last_name,
                          selectedUser.UA_suffix,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </Text>
                    </View>
                  </View>
                )}
                {selectedUser.UA_created_at && (
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Joined</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {new Date(selectedUser.UA_created_at).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                )}
                {/* Contact Info */}
                <View style={styles.sectionHeaderRow}>
                  <FontAwesome
                    name="envelope"
                    size={width * 0.045}
                    color="#94A3B8"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.sectionHeader}>Contact Info</Text>
                </View>
                {!selectedUser.UA_email_address &&
                  !selectedUser.UA_phone_number && (
                    <Text style={styles.sectionText}>
                      No contact info associated with the user!
                    </Text>
                  )}
                {selectedUser.UA_email_address && (
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Email</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedUser.UA_email_address}
                      </Text>
                    </View>
                  </View>
                )}
                {selectedUser.UA_phone_number && (
                  <View style={styles.twoColumnContainer}>
                    <View style={styles.labelColumn}>
                      <Text style={styles.sectionTitle}>Phone</Text>
                    </View>
                    <View style={styles.contentColumn}>
                      <Text style={styles.sectionText}>
                        {selectedUser.UA_phone_number}
                      </Text>
                    </View>
                  </View>
                )}
                {/* Reputation Info */}
                <View style={styles.sectionHeaderRow}>
                  <FontAwesome
                    name="star"
                    size={width * 0.045}
                    color="#94A3B8"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.sectionHeader}>Reputation</Text>
                </View>
                {selectedUser.UA_reputation_score !== undefined &&
                  selectedUser.UA_reputation_score !== null && (
                    <View style={styles.twoColumnContainer}>
                      <View style={styles.labelColumn}>
                        <Text style={styles.sectionTitle}>
                          Reputation Score
                        </Text>
                      </View>
                      <View style={styles.contentColumn}>
                        <Text style={styles.sectionText}>
                          {selectedUser.UA_reputation_score} RS
                        </Text>
                      </View>
                    </View>
                  )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeUserModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.noReportText}>No user selected</Text>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: width * 0.06,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: width * 0.055,
    fontWeight: "700",
    color: "#f97316",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },
  sectionTitle: {
    fontSize: width * 0.038,
    fontWeight: "600",
    color: "#f97316",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: height * 0.01,
  },
  sectionText: {
    fontSize: width * 0.038,
    color: "#E2E8F0",
    lineHeight: height * 0.025,
    marginBottom: height * 0.005,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
  },
  sectionHeader: {
    fontSize: width * 0.038,
    color: "#94A3B8",
    fontWeight: "bold",
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  twoColumnContainer: {
    flexDirection: "row",
    marginBottom: height * 0.01,
  },
  labelColumn: {
    width: "50%",
    justifyContent: "center",
  },
  contentColumn: {
    width: "50%",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  closeButton: {
    marginTop: height * 0.03,
    backgroundColor: "#f97316",
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: width * 0.042,
    letterSpacing: 0.5,
  },
  noReportText: {
    fontSize: width * 0.04,
    color: "#94A3B8",
    textAlign: "center",
    paddingVertical: height * 0.03,
  },
});

export default TeamsPanel;
