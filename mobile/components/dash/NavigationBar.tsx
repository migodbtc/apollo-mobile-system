import React, { useState } from "react";
import { LayoutAnimation } from "react-native";
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
import { RoleBasedButtonsConfig } from "@/constants/types/component";

LayoutAnimation.configureNext({
  duration: 100,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
});

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
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // animation na dinagdag ko pag pinindot yung "more" basically naglagay lang ako fade transition hahahahaha
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
    admin: [
      { iconName: "home", label: "Home", panel: "home" },
      { iconName: "map", label: "Map", panel: "map" },
      { iconName: "camera", label: "", panel: "camera", isCamera: true },
      { iconName: "pie-chart", label: "Reports", panel: "reports" },
      {
        iconName: "bars",
        label: "More",
        panel: "more",
        subItems: [
          { iconName: "database", label: "Database", panel: "database" },
          { iconName: "bug", label: "Meta", panel: "meta" },
          { iconName: "lock", label: "Privileges", panel: "privileges" },
          { iconName: "info-circle", label: "About", panel: "about" },
        ],
      },
    ],
    superadmin: [
      { iconName: "home", label: "Home", panel: "home" },
      { iconName: "map", label: "Map", panel: "map" },
      { iconName: "camera", label: "", panel: "camera", isCamera: true },
      { iconName: "pie-chart", label: "Reports", panel: "reports" },
      {
        iconName: "bars",
        label: "More",
        panel: "more",
        subItems: [
          { iconName: "lock", label: "Privileges", panel: "privileges" },
          { iconName: "database", label: "Database", panel: "database" },
          { iconName: "bug", label: "Meta", panel: "meta" },
          { iconName: "history", label: "History", panel: "history" },
          { iconName: "users", label: "Team", panel: "team" },
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
    backgroundColor: "#020617",
    height: height * 0.1,
    position: "relative",
    bottom: height * 0.05,
    zIndex: 1,
    borderTopColor: "#11162B",
    borderTopWidth: 2,
  },
  moreMenu: {
    position: "absolute",
    bottom: height * 0.1 - 2,
    right: width * 0.01,
    backgroundColor: "#020617",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingVertical: height * 0.01,
    width: width * 0.2,
    zIndex: 0,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#11162B",
    borderBottomColor: "transparent",
  },
  subItemButton: {
    width: "100%",
    paddingVertical: height * 0.025,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NavigationBar;
