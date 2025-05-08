import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import NavigationButton from "./NavigationButton";
import { NavigationBarProps } from "@/constants/interfaces/components";
import { useSession } from "@/constants/contexts/SessionContext";
import { RoleBasedButtonsConfig } from "@/constants/type/component";

const { width, height } = Dimensions.get("window");

const NavigationBar: React.FC<NavigationBarProps> = ({
  selectedPanel,
  setSelectedPanel,
}) => {
  const router = useRouter();
  const { sessionData, setSessionData } = useSession();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handlePress = (panel: string) => {
    if (panel === "camera") {
      router.push("/capture");
    } else if (panel === "more") {
      setShowMoreMenu(!showMoreMenu);
    } else {
      setSelectedPanel(panel);
      setShowMoreMenu(false);
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
      { iconName: "camera", label: "", panel: "camera", isCamera: true },
      { iconName: "pie-chart", label: "Reports", panel: "reports" },
      {
        iconName: "bars",
        label: "More",
        panel: "more",
        subItems: [
          { iconName: "history", label: "History", panel: "history" },
          { iconName: "users", label: "Team", panel: "team" },
          { iconName: "info-circle", label: "About", panel: "about" },
        ],
      },
    ],
    sysad: [
      { iconName: "home", label: "Home", panel: "home" },
      { iconName: "map", label: "Map", panel: "map" },
      { iconName: "camera", label: "", panel: "camera", isCamera: true },
      { iconName: "database", label: "Database", panel: "database" },
      {
        iconName: "bars",
        label: "More",
        panel: "more",
        subItems: [
          { iconName: "bug", label: "Meta", panel: "meta" },
          { iconName: "info-circle", label: "About", panel: "about" },
        ],
      },
    ],
  };

  // Get the buttons for the current user role
  const buttons = roleBasedButtons[sessionData?.UA_user_role || "civilian"];

  return (
    <TouchableWithoutFeedback onPress={() => setShowMoreMenu(false)}>
      <View style={styles.container}>
        {buttons.map((button) => (
          <React.Fragment key={button.panel}>
            <NavigationButton
              iconName={button.iconName}
              label={button.label}
              isSelected={
                selectedPanel === button.panel ||
                (button.subItems?.some(
                  (item) => item.panel === selectedPanel
                ) ??
                  false)
              }
              onPress={() => handlePress(button.panel)}
              isCamera={button.isCamera || false}
            />

            {/* More menu dropdown */}
            {button.panel === "more" && showMoreMenu && (
              <View style={styles.moreMenu}>
                {button.subItems?.map((subItem) => (
                  <NavigationButton
                    key={subItem.panel}
                    iconName={subItem.iconName}
                    label={subItem.label}
                    isSelected={selectedPanel === subItem.panel}
                    onPress={() => {
                      setSelectedPanel(subItem.panel);
                      setShowMoreMenu(false);
                    }}
                    styled={styles.subItemButton}
                  />
                ))}
              </View>
            )}
          </React.Fragment>
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "#11162B",
    height: height * 0.1,
    position: "relative",
    zIndex: 1,
  },
  moreMenu: {
    position: "absolute",
    bottom: height * 0.1,
    right: width * 0.01,
    backgroundColor: "#11162B",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: width * 0.02,
    paddingVertical: height * 0.01,
    width: width * 0.2,
    zIndex: 0,
    alignItems: "center",
  },
  subItemButton: {
    width: "100%",
    paddingVertical: height * 0.025,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NavigationBar;
