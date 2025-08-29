import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAdminSQL } from "@/constants/contexts/AdminSQLContext";
import { UserAccount } from "@/constants/interfaces/database";
import { useSession } from "@/constants/contexts/SessionContext";

const { width, height } = Dimensions.get("window");

// Empty functions for now
const promoteToResponder = (userId: number) => {
  // TODO: Implement promote logic
  console.log("Promote to responder:", userId);
};
const revokeResponder = (userId: number) => {
  // TODO: Implement revoke logic
  console.log("Revoke responder:", userId);
};

const PrivilegesPanel = () => {
  const { userAccounts } = useAdminSQL();
  const { sessionData } = useSession();
  const [helpVisible, setHelpVisible] = useState(false);

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

  const civilians = userAccounts.filter((u) => u.UA_user_role === "civilian");
  const responders = userAccounts.filter((u) => u.UA_user_role === "responder");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Privileges Management</Text>
      <Text style={styles.subtext}>
        Manage user roles. Promote civilians to responders or revoke responder
        privileges.
      </Text>
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => setHelpVisible(!helpVisible)}
      >
        <FontAwesome
          name="question-circle"
          size={width * 0.045}
          color="#f97316"
        />
        <Text style={styles.helpButtonText}> Help</Text>
      </TouchableOpacity>
      {helpVisible && (
        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            Civilians can be promoted to responders. Responders can be revoked
            back to civilians. Use the buttons below to manage privileges.
          </Text>
        </View>
      )}
      <Text style={styles.sectionTitle}>Civilians</Text>
      {civilians.length === 0 ? (
        <Text style={styles.emptyText}>No civilians found.</Text>
      ) : (
        civilians.map((user) => (
          <View key={user.UA_user_id} style={styles.userCard}>
            <Text style={styles.userName}>@{user.UA_username}</Text>
            <TouchableOpacity
              style={styles.promoteButton}
              onPress={() => promoteToResponder(user.UA_user_id)}
            >
              <FontAwesome name="arrow-up" size={width * 0.04} color="white" />
              <Text style={styles.buttonText}> Promote</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
      <Text style={styles.sectionTitle}>Responders</Text>
      {responders.length === 0 ? (
        <Text style={styles.emptyText}>No responders found.</Text>
      ) : (
        responders.map((user) => (
          <View key={user.UA_user_id} style={styles.userCard}>
            <Text style={styles.userName}>@{user.UA_username}</Text>
            <TouchableOpacity
              style={styles.revokeButton}
              onPress={() => revokeResponder(user.UA_user_id)}
            >
              <FontAwesome
                name="user-times"
                size={width * 0.04}
                color="white"
              />
              <Text style={styles.buttonText}> Revoke</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.08,
    backgroundColor: "#11162B",
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
    marginBottom: height * 0.01,
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
    marginTop: height * 0.03,
    marginBottom: 4,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: width * 0.032,
    marginBottom: 8,
  },
  userCard: {
    backgroundColor: "#23263a",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userName: {
    color: "#fff",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
  promoteButton: {
    backgroundColor: "#16A34A",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  revokeButton: {
    backgroundColor: "#DC2626",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.035,
    marginLeft: 4,
  },
});

export default PrivilegesPanel;
