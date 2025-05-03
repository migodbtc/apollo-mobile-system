import { View } from "react-native";
import React, { useEffect } from "react";
import LoginBox from "@/components/auth/LoginBox";

const Login = () => {
  return (
    <View className="flex-1 justify-center items-center bg-slate-950">
      <LoginBox />
    </View>
  );
};

export default Login;
