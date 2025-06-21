import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, } from "react-native";
import { Dimensions } from "react-native";
import {
    PostverifiedReport,
    PreverifiedReport,
  } from "@/constants/interfaces/database";

const { width, height } = Dimensions.get("window");

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Verified", value: "verified" },
  { label: "False Alarm", value: "false alarm" },
  { label: "Resolved", value: "resolved" },
];

type EditReportModalProps = {
  visible: boolean;
  onClose: () => void;
  reportData: PreverifiedReport | PostverifiedReport | null;
  onSave: (updatedData: any) => void;
};

export const EditReportModal = ({
  visible,
  onClose,
  reportData,
  onSave,
}: EditReportModalProps) => {
    const [notes, setNotes] = React.useState("");
    const [selectedStatus, setSelectedStatus] = useState("pending")
      
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>EDIT REPORT STATUS</Text>
          
          {/* butones na radyo */}
          <View style={styles.radioContainer}>
            <View style={styles.radioColumn}>
              {statusOptions.slice(0, 2).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioButton}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <View style={styles.radioCircle}>
                    {selectedStatus === option.value && <View style={styles.selectedRb} />}
                  </View>
                  <Text style={styles.radioText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.radioColumn}>
              {statusOptions.slice(2, 4).map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioButton}
                  onPress={() => setSelectedStatus(option.value)}
                >
                  <View style={styles.radioCircle}>
                    {selectedStatus === option.value && <View style={styles.selectedRb} />}
                  </View>
                  <Text style={styles.radioText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Save Button (WALA PANG BACKEND KASI HEHE*/}
          <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={() => onSave({
              ...reportData,
              ...(reportData as PreverifiedReport).PR_report_status && { PR_report_status: selectedStatus },
              notes
            })}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={() => {
              setSelectedStatus("pending");
              onClose();
            }}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.descriptionText}>
             This modal allows you to edit the report status, making it easy to update the report's current state. You can select from options like Pending, Verified, False Alarm, or Resolved. Once you make your selection, click Save to apply the changes.
          </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: width * 0.90,
    height: height * 0.40,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    color: "#F97316",
    fontSize: width * 0.045,
    fontWeight: "bold",
    alignItems: "center",
    textAlign: "center",
    marginBottom: 15,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    height: height * 0.07,
  },
  radioColumn: {
    flex: 1, 
    paddingHorizontal: 10,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 9,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F97316",
  },
  radioText: {
    color: "white",
    fontSize: 17,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 50,
  },
  
  saveButton: {
    backgroundColor: "#F97316",
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginRight: 10,
  },
  resetButton: {
    backgroundColor: "#42475A",
    paddingVertical: 10,
    paddingHorizontal: 60,
    borderRadius: 12,
    marginLeft: 10,
  },
  descriptionText: {
    backgroundColor: "#1E293B",
    color: "#94A3B8",
    fontSize: width * 0.032,
    height: 55,
    width: "102%",
    paddingLeft: 10,
    position: "absolute",
    marginTop: 48,
  },
  closeButton: {
    backgroundColor: "#F97316",
    paddingVertical: 10,
    paddingHorizontal: 145,
    borderRadius: 12,
    position: "absolute",
    marginTop: 110,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});