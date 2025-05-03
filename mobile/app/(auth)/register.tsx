import { StyleSheet, Text, View } from "react-native";
import React from "react";
import RegisterBox from "@/components/auth/RegisterBox";

const Register = () => {
  return (
    <View className="flex-1 justify-center items-center bg-slate-950">
      <RegisterBox />
    </View>
  );
};

export default Register;
