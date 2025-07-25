import {
  View,
  Text,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import faqs from "@/constants/faq";
import { LayoutAnimation } from "react-native";

const { width, height } = Dimensions.get("window");

const AboutPanel = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const developmentTeam = [
    {
      name: "Miguel Justin Bunda",
      role: "Project Manager, Lead Fullstack Developer, Database Administrator, Systems Architect, UI/UX Designer, Assistant Technical Writer, Visionary Associate, GIS Developer, Lead Mobile Developer, Lead R&D Engineer, DevOps Engineer, ML Engineer",
    },
    {
      name: "Leeroi Claudio",
      role: "Lead Backend Developer, Assistant Database Administrator, R&D Associate, Assistant Mobile Developer, Assistant Fullstack Developer, Assistant Technical Writer",
    },
    {
      name: "Mareus Gabriel Manzano",
      role: "Lead Database Admnistrator, R&D Associate, Visionary Lead, Assistant Technical Writer",
    },
    {
      name: "Gideon Rico Agan",
      role: "Lead Technical Writer, Logistics Manager",
    },
    {
      name: "Ferdinand Hassan Flojo",
      role: "Capstone Advisor, Professor, Mentor",
    },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: width * 0.1,
        paddingTop: height * 0.015,
      }}
    >
      {/* Title */}
      <Text
        style={{
          color: "#F97316",
          fontSize: width * 0.045,
          fontWeight: "bold",
          marginBottom: 16,
        }}
      >
        <FontAwesome name="info" size={width * 0.045} />
        {"  "}About Apollo
      </Text>

      {/* Description */}
      <Text
        style={{
          color: "white",
          fontSize: width * 0.03,
          lineHeight: 24,
          marginBottom: 16,
        }}
      >
        Apollo is a real-time fire detection and reporting system designed to
        enhance emergency response efficiency. Using AI-powered fire
        recognition, GIS-based location tracking, and automated alerts, Apollo
        ensures faster, more accurate fire incident reporting. The app enables
        users to capture and submit fire reports with real-time geotagging,
        while responders receive instant notifications for swift action.
        Designed in collaboration with fire stations, Apollo streamlines
        communication, minimizes response delays, and improves public safety.
      </Text>

      <Text style={[styles.title, { fontSize: width * 0.045 }]}>
        <FontAwesome name="question-circle" size={width * 0.045} />
        {"  "}Frequently Asked Questions
      </Text>

      {faqs.map((item, index) => (
        <View key={index} style={styles.faqItem}>
          <TouchableOpacity
            onPress={() => toggleExpand(index)}
            style={styles.questionContainer}
          >
            <Text style={[styles.questionText, { fontSize: width * 0.035 }]}>
              {item.question}
            </Text>
            <FontAwesome
              name={expandedIndex === index ? "chevron-up" : "chevron-down"}
              size={width * 0.035}
              color="#F97316"
            />
          </TouchableOpacity>

          {expandedIndex === index && (
            <Text style={[styles.answerText, { fontSize: width * 0.03 }]}>
              {item.answer}
            </Text>
          )}
        </View>
      ))}

      {/* DEVELOPER CREDITS */}
      <Text
        style={{
          color: "#F97316",
          fontSize: width * 0.045,
          fontWeight: "bold",
          marginVertical: height * 0.02,
        }}
      >
        <FontAwesome name="code" size={width * 0.045} />
        {"  "}Current Developers
      </Text>
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: "#F97316",
            paddingBottom: height * 0.01,
            marginBottom: height * 0.015,
            gap: width * 0.07,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: width * 0.035,
              fontWeight: "bold",
              flex: 1,
            }}
          >
            Name
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: width * 0.035,
              fontWeight: "bold",
              flex: 2,
            }}
          >
            Role
          </Text>
        </View>

        {developmentTeam.map((member, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: height * 0.02,

              gap: width * 0.07,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: width * 0.03,
                flex: 1,
              }}
            >
              {member.name}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: width * 0.03,
                flex: 2,
              }}
            >
              {member.role}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: width * 0.025,
          lineHeight: 20,
          marginTop: 16,
          textAlign: "center",
          marginBottom: height * 0.1,
        }}
      >
        Thank you for using ApolloExpo! We’re constantly working to improve your
        experience. If you have any feedback, feel free to reach out to us.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    color: "#F97316",
    fontWeight: "bold",
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 8,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionText: {
    color: "#838CB1",
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  answerText: {
    color: "white",
    marginTop: 8,
    lineHeight: 24,
  },
});

export default AboutPanel;
