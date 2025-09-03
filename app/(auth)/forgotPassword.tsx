import { auth } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset Email Sent",
        "Check your inbox for the reset link."
      );
      setEmail("");
    } catch (err: any) {
      console.error("Password reset failed:", err);
      Alert.alert("Error", err.message || "Failed to send reset email.");
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <Text className="text-2xl font-bold mb-6 text-center">
        Forgot Password
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          borderColor: "#d1d5db",
          borderRadius: 10,
          padding: 12,
          marginBottom: 16,
          backgroundColor: "#f9fafb",
        }}
      />

      <TouchableOpacity
        onPress={handleResetPassword}
        className="bg-blue-600 p-4 rounded-lg"
      >
        <Text className="text-white font-semibold text-center">
          Send Reset Email
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPassword;
