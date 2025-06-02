import { ScrollView, Text, View, StyleSheet, Dimensions } from "react-native";
import React from "react";
import LoginBox from "@/components/auth/LoginBox";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const Login = () => {
  const rolesData = [
    {
      role: "Guest",
      canDo: "View daily submitted reports.",
      cannotDo: "New account registration, Edit user profiles, Modify system settings, Database access, Grant admin/responder roles, Delete accounts/media, Verify/delete reports, Authenticate to admin applications, Submit reports/media, View media bound to reports, View reports on maps.",
    },
    {
      role: "Civilian",
      canDo: "New account registration, Edit *own* user profiles, Submit reports/media, View submitted media, View reports on Apollo maps, View daily submitted reports.",
      cannotDo: "Modify system settings, Database access, Grant admin/responder roles, Delete accounts/media, Verify/delete reports, Authenticate to admin applications.",
    },
    {
      role: "Responder",
      canDo: "New account registration, Edit *own* user profiles, Manually verify unverified reports, Delete existing reports, Authenticate to mobile/website admin applications, Submit reports/media, View submitted media, View reports on Apollo maps, View daily submitted reports.",
      cannotDo: "Modify system settings, Database access, Grant admin/responder roles, Delete accounts/media.",
    },
    {
      role: "Admin",
      canDo: "New account registration, Edit user profiles (any), Modify system settings, Database access, Delete submitted media, Manually verify unverified reports, Delete existing reports, Authenticate to mobile/website admin applications, Submit reports/media, View submitted media, View reports on Apollo maps, View daily submitted reports.",
      cannotDo: "Grant admin role to civilian-level users, Delete accounts in user accounts table, Give timeout/permanent ban to uncompliant user accounts, Grant responder role to civilian-level users.",
    },
    {
      role: "Superadmin",
      canDo: "All listed privileges (New account registration, Edit user profiles, Modify system settings, Database access, Grant admin/responder roles, Delete accounts/media, Give timeout/permanent ban to uncompliant users, Manually verify/delete reports, Authenticate to admin applications, Submit reports/media, View submitted media/reports on maps, View daily submitted reports).",
      cannotDo: "(No limitations – can do everything.)",
    },
  ];

  // Helper function to get background color based on role
  const getRoleBackgroundColor = (roleName: string) => {
    switch (roleName) {
      case 'Guest':
        return '#4A5568';
      case 'Civilian':
        return '#3B82F6';
      case 'Responder':
        return '#F59E0B';
      case 'Admin':
        return '#EF4444';
      case 'Superadmin':
        return '#01B073';
      default:
        return 'transparent'; // Fallback
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center p-2">
          <LoginBox />

          {/* Extra scrollable text */}
          <View style={{ height: 200 }} />
          <Text className="text-2xl mt-50 leading-9 text-center"
            style={{ color: "#c2410c" }}>
            Scroll down for more information.
            {"\n\n\n\n\n"}
          </Text>

          <Text className="text-white font-bold text-lg mt-70 leading-6 text-center">
            Apollo's (Hephaestus') Different Roles in the System:
          </Text>

          {/* Grid Header */}
          <View style={styles.gridHeader}>
            <Text style={[styles.gridHeaderText, { flex: 0.8 }]}>Role</Text>
            <Text style={[styles.gridHeaderText, { flex: 1.5 }]}>Can Do</Text>
            <Text style={[styles.gridHeaderText, { flex: 1.5 }]}>Cannot Do</Text>
          </View>

          {/* Grid Rows */}
          {rolesData.map((item, index) => (
            <View
              key={index}
              style={[
                styles.gridRow,
                { backgroundColor: index % 2 === 0 ? '#1E293B' : '#0F172A' } // Alternating row background
              ]}
            >
              {/* Role cell with specific background and border */}
              <Text
                style={[
                  styles.gridCellText,
                  { flex: 0.8, fontWeight: 'bold' },
                  {
                    backgroundColor: getRoleBackgroundColor(item.role), // Background color of the cell
                    borderWidth: 1, 
                    height: 20,                                 // Border width
                    borderRadius: 5,                                 // Optional: rounded corners for the cell
                    paddingVertical: 5,                              // Add some vertical padding inside the cell
                    textAlign: 'center',                             // Center the text within its bordered cell
                  }
                ]}
              >
                {item.role}
              </Text>
              <Text style={[styles.gridCellText, { flex: 1.5 }]}>{item.canDo}</Text>
              <Text style={[styles.gridCellText, { flex: 1.5 }]}>{item.cannotDo}</Text>
            </View>
          ))}

          {/* Add some space at the bottom */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#F97316',
    paddingVertical: 10,
    marginTop: 20,
    width: '95%',
  },
  gridHeaderText: {
    color: '#F97316',
    fontWeight: 'bold',
    fontSize: width * 0.035,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
    paddingVertical: 10,
    width: '95%',
    borderRadius: 5,
    marginBottom: 5,
  },
  gridCellText: {
    color: 'white',
    fontSize: width * 0.028,
    // Removed paddingVertical and textAlign from here, as they are now applied to the specific role cell for better control
    paddingHorizontal: 5, // Keep horizontal padding
  },
});

export default Login;