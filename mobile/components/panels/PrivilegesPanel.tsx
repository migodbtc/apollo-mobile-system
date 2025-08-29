import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";
import { UserAccount } from "@/constants/interfaces/database";
import { useSession } from "@/constants/contexts/SessionContext";
import axios from "axios";
import SERVER_LINK from "@/constants/netvar";

const { width, height } = Dimensions.get("window");

const PrivilegesPanel = () => {
  const { userAccounts, fetchUserAccounts } = useAdminSQL();
  const { sessionData } = useSession();
  const [helpVisible, setHelpVisible] = useState(false);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  // Handler functions for privilege changes
  // Feedback modal state
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    message: "",
    isError: false,
  });

  const showFeedback = (message: string, isError = false) => {
    setFeedbackModal({ visible: true, message, isError });
    setTimeout(
      () => setFeedbackModal({ visible: false, message: "", isError: false }),
      2000
    );
  };

  const refreshPanel = useCallback(async () => {
    await fetchUserAccounts();
  }, [fetchUserAccounts]);

  useEffect(() => {
    refreshPanel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const promoteToResponder = async (userId: number) => {
    try {
      await axios.post(`${SERVER_LINK}/user/update`, {
        UA_user_id: userId,
        UA_user_role: "responder",
      });
      showFeedback("User promoted to responder.");
    } catch (err: any) {
      console.error("Promote to responder error:", err);
      showFeedback("Failed to promote to responder.", true);
    }
  };
  const promoteToAdmin = async (userId: number) => {
    try {
      await axios.post(`${SERVER_LINK}/user/update`, {
        UA_user_id: userId,
        UA_user_role: "admin",
      });
      showFeedback("User promoted to admin.");
    } catch (err: any) {
      console.error("Promote to admin error:", err);
      showFeedback("Failed to promote to admin.", true);
    }
  };
  const demoteToCivilian = async (userId: number) => {
    try {
      await axios.post(`${SERVER_LINK}/user/update`, {
        UA_user_id: userId,
        UA_user_role: "civilian",
      });
      showFeedback("User demoted to civilian.");
    } catch (err: any) {
      console.error("Demote to civilian error:", err);
      showFeedback("Failed to demote to civilian.", true);
    }
  };
  const revokeResponder = async (userId: number) => {
    try {
      await axios.post(`${SERVER_LINK}/user/update`, {
        UA_user_id: userId,
        UA_user_role: "civilian",
      });
      showFeedback("Responder privileges revoked.");
    } catch (err: any) {
      console.error("Revoke responder error:", err);
      showFeedback("Failed to revoke responder.", true);
    }
  };

  {
    /* Feedback Modal */
  }
  <Modal
    visible={feedbackModal.visible}
    transparent
    animationType="fade"
    onRequestClose={() =>
      setFeedbackModal({ visible: false, message: "", isError: false })
    }
  >
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
      }}
    >
      <View
        style={{
          backgroundColor: feedbackModal.isError ? "#DC2626" : "#16A34A",
          borderRadius: 10,
          paddingVertical: 18,
          paddingHorizontal: 32,
          minWidth: width * 0.5,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: width * 0.04,
            textAlign: "center",
          }}
        >
          {feedbackModal.message}
        </Text>
      </View>
    </View>
  </Modal>;
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<null | {
    type: "promoteResponder" | "promoteAdmin" | "demoteCivilian";
    user: UserAccount;
  }>(null);

  const openModal = (
    type: "promoteResponder" | "promoteAdmin" | "demoteCivilian",
    user: UserAccount
  ) => {
    setModalAction({ type, user });
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setModalAction(null);
  };

  const handleModalConfirm = async () => {
    if (!modalAction) return;
    const userId = modalAction.user.UA_user_id;
    const key = `${modalAction.type}_${userId}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      if (modalAction.type === "promoteResponder")
        await promoteToResponder(userId);
      if (modalAction.type === "promoteAdmin") await promoteToAdmin(userId);
      if (modalAction.type === "demoteCivilian") await demoteToCivilian(userId);
      // Refresh user accounts after backend change
      await refreshPanel();
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
      closeModal();
    }
  };

  if (
    !sessionData ||
    !["admin", "superadmin"].includes(sessionData.UA_user_role?.toLowerCase())
  ) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Privileges</Text>
        <Text style={styles.subtext}>
          You do not have permission to view this page.
        </Text>
      </View>
    );
  }

  const [search, setSearch] = useState("");
  const civilians = userAccounts.filter((u) => u.UA_user_role === "civilian");
  const responders = userAccounts.filter((u) => u.UA_user_role === "responder");
  const admins = userAccounts.filter((u) => u.UA_user_role === "admin");
  // Filter by search (username only)
  const filteredResponders = responders.filter((u) =>
    u.UA_username.toLowerCase().includes(search.toLowerCase())
  );
  const filteredCivilians = civilians.filter((u) =>
    u.UA_username.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAdmins = admins.filter((u) =>
    u.UA_username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: height * 0.1 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text style={styles.header}>
          <FontAwesome name="shield" color="#f97316" size={width * 0.058} />
          {"  "}Privileges Management
        </Text>
      </View>
      <Text style={styles.subtext}>
        Manage user roles. Promote civilians to responders or revoke responder
        privileges.
      </Text>
      <View
        style={{
          marginHorizontal: 0,
          marginBottom: 10,
          marginTop: 2,
          backgroundColor: "transparent",
          overflow: "hidden",
        }}
      >
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => setHelpVisible((prev) => !prev)}
          activeOpacity={0.8}
        >
          <FontAwesome name="info-circle" size={width * 0.04} color="#64748B" />
          <Text
            style={{
              color: "#64748B",
              fontWeight: "bold",
              fontSize: width * 0.035,
              marginLeft: 8,
              flex: 1,
            }}
          >
            Help
          </Text>
          <FontAwesome
            name={helpVisible ? "chevron-up" : "chevron-down"}
            size={width * 0.04}
            color="#64748B"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
        {helpVisible && (
          <View style={{ padding: 12 }}>
            <Text style={[styles.subtext, { fontStyle: "italic" }]}>
              Civilians can be promoted to responders. Responders can be revoked
              back to civilians. Use the buttons below to manage privileges.
            </Text>
            <Text style={[styles.subtext, { fontStyle: "italic" }]}>
              ONLY ADMINS CAN MANAGE PRIVILEGES!
            </Text>
          </View>
        )}
      </View>
      <View style={styles.searchBarContainer}>
        <FontAwesome
          name="search"
          size={width * 0.045}
          color="#94A3B8"
          style={{ marginLeft: 8, marginRight: 8 }}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search users..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <Text style={[styles.sectionTitle, { fontSize: width * 0.038 }]}>
        <FontAwesome name="user-md" size={width * 0.038} color="#f97316" />{" "}
        Responders
      </Text>
      {filteredResponders.length === 0 ? (
        <Text style={[styles.emptyText, { fontSize: width * 0.028 }]}>
          No responders found.
        </Text>
      ) : (
        filteredResponders.map((user) => (
          <View key={user.UA_user_id} style={styles.userCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="user-md"
                size={width * 0.04}
                color="#f97316"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.userName, { fontSize: width * 0.032 }]}>
                @{user.UA_username}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.revokeButton,
                {
                  opacity: loading[`demoteCivilian_${user.UA_user_id}`]
                    ? 0.7
                    : 1,
                },
              ]}
              onPress={() => openModal("demoteCivilian", user)}
              disabled={loading[`demoteCivilian_${user.UA_user_id}`]}
            >
              {loading[`demoteCivilian_${user.UA_user_id}`] ? (
                <FontAwesome
                  name="spinner"
                  size={width * 0.032}
                  color="white"
                  style={{ marginRight: 6 }}
                />
              ) : (
                <FontAwesome
                  name="user-times"
                  size={width * 0.032}
                  color="white"
                  style={{ marginRight: 6 }}
                />
              )}
              <Text style={[styles.buttonText, { fontSize: width * 0.028 }]}>
                {" "}
                Revoke
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      <Text
        style={[
          styles.sectionTitle,
          { marginTop: height * 0.03, fontSize: width * 0.038 },
        ]}
      >
        <FontAwesome name="user" size={width * 0.038} color="#f97316" />{" "}
        Civilians
      </Text>
      {filteredCivilians.length === 0 ? (
        <Text style={[styles.emptyText, { fontSize: width * 0.028 }]}>
          No civilians found.
        </Text>
      ) : (
        filteredCivilians.map((user) => (
          <View key={user.UA_user_id} style={styles.userCard}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome
                name="user"
                size={width * 0.04}
                color="#f97316"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.userName, { fontSize: width * 0.032 }]}>
                @{user.UA_username}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[
                  styles.promoteButton,
                  {
                    backgroundColor: "#f59e42",
                    opacity: loading[`promoteResponder_${user.UA_user_id}`]
                      ? 0.7
                      : 1,
                  },
                ]}
                onPress={() => openModal("promoteResponder", user)}
                disabled={loading[`promoteResponder_${user.UA_user_id}`]}
              >
                {loading[`promoteResponder_${user.UA_user_id}`] ? (
                  <FontAwesome
                    name="spinner"
                    size={width * 0.032}
                    color="white"
                    style={{ marginRight: 6 }}
                  />
                ) : (
                  <FontAwesome
                    name="arrow-up"
                    size={width * 0.032}
                    color="white"
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text style={[styles.buttonText, { fontSize: width * 0.028 }]}>
                  {" "}
                  Responder
                </Text>
              </TouchableOpacity>
              {sessionData.UA_user_role === "superadmin" && (
                <TouchableOpacity
                  style={[
                    styles.promoteButton,
                    {
                      backgroundColor: "#16A34A",
                      marginLeft: 8,
                      opacity: loading[`promoteAdmin_${user.UA_user_id}`]
                        ? 0.7
                        : 1,
                    },
                  ]}
                  onPress={() => openModal("promoteAdmin", user)}
                  disabled={loading[`promoteAdmin_${user.UA_user_id}`]}
                >
                  {loading[`promoteAdmin_${user.UA_user_id}`] ? (
                    <FontAwesome
                      name="spinner"
                      size={width * 0.032}
                      color="white"
                      style={{ marginRight: 6 }}
                    />
                  ) : (
                    <FontAwesome
                      name="shield"
                      size={width * 0.032}
                      color="white"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text
                    style={[styles.buttonText, { fontSize: width * 0.028 }]}
                  >
                    {" "}
                    Admin
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}

      {sessionData.UA_user_role === "superadmin" && (
        <>
          <Text
            style={[
              styles.sectionTitle,
              { marginTop: height * 0.03, fontSize: width * 0.038 },
            ]}
          >
            <FontAwesome name="shield" size={width * 0.038} color="#f97316" />{" "}
            Admins
          </Text>
          {filteredAdmins.length === 0 ? (
            <Text style={[styles.emptyText, { fontSize: width * 0.028 }]}>
              No admins found.
            </Text>
          ) : (
            filteredAdmins.map((user) => (
              <View key={user.UA_user_id} style={styles.userCard}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <FontAwesome
                    name="shield"
                    size={width * 0.04}
                    color="#f97316"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.userName, { fontSize: width * 0.032 }]}>
                    @{user.UA_username}
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={styles.revokeButton}
                    onPress={() => openModal("demoteCivilian", user)}
                  >
                    <FontAwesome
                      name="user-times"
                      size={width * 0.032}
                      color="white"
                    />
                    <Text
                      style={[styles.buttonText, { fontSize: width * 0.028 }]}
                    >
                      {" "}
                      Demote
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          {/* Confirmation Modal (styled like SelectedReportModal) */}
          <Modal
            visible={modalVisible}
            transparent
            animationType="fade"
            onRequestClose={closeModal}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.8)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: width * 0.7, // smaller modal
                  backgroundColor: "#1a2232",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#334155",
                  padding: width * 0.035, // less padding
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: width * 0.032, // smaller header
                    fontWeight: "700",
                    color: "#f97316",
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginTop: height * 0.01,
                    marginBottom: 8,
                  }}
                >
                  Confirm Action
                </Text>
                {modalAction && (
                  <Text
                    style={{
                      color: "#E2E8F0",
                      fontSize: width * 0.032,
                      textAlign: "center",
                      marginBottom: 14,
                      lineHeight: height * 0.025,
                    }}
                  >
                    {modalAction.type === "promoteResponder" &&
                      `Promote @${modalAction.user.UA_username} to Responder?`}
                    {modalAction.type === "promoteAdmin" &&
                      `Promote @${modalAction.user.UA_username} to Admin?`}
                    {modalAction.type === "demoteCivilian" &&
                      `Demote @${modalAction.user.UA_username} to Civilian?`}
                  </Text>
                )}
                <View style={{ flexDirection: "row", marginTop: 4 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#16A34A",
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      marginRight: 8,
                    }}
                    onPress={handleModalConfirm}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: width * 0.032,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <FontAwesome
                        name="check"
                        size={width * 0.028}
                        color="#fff"
                      />
                      {"  "}Confirm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#DC2626",
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                    }}
                    onPress={closeModal}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: width * 0.032,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <FontAwesome
                        name="times"
                        size={width * 0.028}
                        color="#fff"
                      />
                      {"  "}Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
  header: {
    color: "#f97316",
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginTop: height * 0.02,
    marginBottom: 4,
  },
  subtext: {
    color: "#9CA3AF",
    fontSize: width * 0.035,
    marginBottom: height * 0.01,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.03,
  },

  helpButtonText: {
    color: "#f97316",
    fontSize: width * 0.035,
    marginLeft: 4,
  },
  helpBox: {
    backgroundColor: "#23263a",
    borderRadius: 8,
    padding: 10,
    marginBottom: height * 0.02,
  },
  helpText: {
    color: "#f97316",
    fontSize: width * 0.032,
  },
  sectionTitle: {
    color: "#f97316",
    fontSize: width * 0.045,
    fontWeight: "bold",
    marginTop: height * 0.01,
    marginBottom: 4,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: width * 0.032,
    marginBottom: 8,
  },
  userCard: {
    backgroundColor: "transparent",
    borderRadius: 0,
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  userName: {
    color: "#fff",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
  promoteButton: {
    backgroundColor: "#16A34A",
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 24,
  },
  revokeButton: {
    backgroundColor: "#DC2626",
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 24,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.032,
    marginLeft: 4,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a2232",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 2,
    paddingHorizontal: 2,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#fff",
    fontSize: width * 0.035,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
});

export default PrivilegesPanel;
