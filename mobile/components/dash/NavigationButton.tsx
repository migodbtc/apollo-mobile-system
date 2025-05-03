import React from "react";
import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { NavigationButtonProps } from "@/constants/interfaces/components";

const { width } = Dimensions.get("window");

const NavigationButton: React.FC<NavigationButtonProps> = ({
  iconName,
  label,
  isSelected,
  onPress,
  isCamera = false,
}) => {
  if (isCamera) {
    return (
      <TouchableOpacity style={styles.cameraButton} onPress={onPress}>
        <FontAwesome
          name={iconName}
          size={width * 0.07}
          style={styles.cameraIcon}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.mainButton, isSelected && styles.selectedButton]}
      onPress={onPress}
    >
      <FontAwesome
        name={iconName}
        size={width * 0.045}
        style={[styles.icon, isSelected && styles.selectedIcon]}
      />
      <Text
        style={[styles.buttonText, isSelected && styles.selectedButtonText]}
      >
        {label.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    borderRadius: 16,
    marginHorizontal: 2,
    backgroundColor: "#00000000",
  },
  selectedButton: {
    backgroundColor: "#c2410c",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: width * 0.025,
    color: "#c2410c",
  },
  selectedButtonText: {
    color: "#11162B",
  },
  icon: {
    color: "#c2410c",
  },
  selectedIcon: {
    color: "#11162B",
  },
  cameraButton: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cameraIcon: {
    color: "#080D24",
    fontSize: width * 0.06,
  },
});

export default NavigationButton;
