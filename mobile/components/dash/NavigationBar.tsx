import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import NavigationButton from "./NavigationButton";
import { NavigationBarProps } from "@/constants/interfaces/components";
import { useSession } from "@/constants/contexts/SessionContext";
import { RoleBasedButtonsConfig } from "@/constants/type/component";

const { height } = Dimensions.get("window");

const NavigationBar: React.FC<NavigationBarProps> = ({
  selectedPanel,
  setSelectedPanel,
}) => {
  const router = useRouter();
  const { sessionData, setSessionData } = useSession();

  const handlePress = (panel: string) => {
    if (panel === "camera") {
      router.push("/capture");
    } else {
      setSelectedPanel(panel);
    }
  };

  // Button configurations for each role
  // Yes the type annotation is necessary, iconName needs to be a type of
  // FontAwesomeIconName, which is defined by "NavigationButtonConfig" inside
  // of RoleBasedButtonsConfig - Migo
  const roleBasedButtons: RoleBasedButtonsConfig = {
    civilian: [
      { iconName: "home", label: "Home", panel: "home" },
      { iconName: "map", label: "Map", panel: "map" },
      { iconName: "camera", label: "", panel: "camera", isCamera: true },
      { iconName: "pie-chart", label: "Reports", panel: "reports" },
      { iconName: "info-circle", label: "About", panel: "about" },
    ],
    responder: [
      { iconName: "home", label: "Home", panel: "home" },
      { iconName: "map", label: "Map", panel: "map" },
      { iconName: "pie-chart", label: "Reports", panel: "reports" },
      { iconName: "camera", label: "", panel: "camera", isCamera: true },
      { iconName: "history", label: "History", panel: "history" },
      { iconName: "users", label: "Team", panel: "team" },
      { iconName: "info-circle", label: "About", panel: "about" },
    ],
    sysad: [
      { iconName: "home", label: "Home", panel: "home" },
      { iconName: "map", label: "Map", panel: "map" },
      { iconName: "camera", label: "", panel: "camera", isCamera: true },
      { iconName: "database", label: "Database", panel: "database" },
      { iconName: "bug", label: "Meta", panel: "meta" },
    ],
  };

  // Get the buttons for the current user role
  const buttons = roleBasedButtons[sessionData?.UA_user_role || "civilian"];

  return (
    <View style={styles.container}>
      {buttons.map((button) => (
        <NavigationButton
          key={button.panel}
          iconName={button.iconName}
          label={button.label}
          isSelected={selectedPanel === button.panel}
          onPress={() => handlePress(button.panel)}
          isCamera={button.isCamera || false}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#11162B",
    height: height * 0.1,
  },
});

export default NavigationBar;
