// app/auth/signup.tsx
import { router } from "expo-router";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { UserPlus } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { app } from "../../firebase"; // adjust if needed

const auth = getAuth(app);

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created successfully!");
      router.replace("../login"); // after signup, go to login
    } catch (error: any) {
      Alert.alert("Signup Error", error.message);
    }
  }

  return (
    <ImageBackground
      source={require("../../assets/images/girl1.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      {/* Dark overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 1,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-6 py-10 justify-between"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <View className="items-center mt-12">
          <Text className="text-white text-5xl mt-4 font-extrabold">
            Sign Up
          </Text>
          <Text className="text-white mt-4 text-base">
            Create an account to get started 🚀
          </Text>
        </View>

        {/* Main Card */}
        <View
          style={styles.glassCard}
          className="rounded-3xl mt-1 p-8 mb-8 shadow-lg"
        >
          {/* Email */}
          <Text className="text-white font-semibold mb-2 text-lg">Email</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.inputClassy}
            className="mb-4"
          />

          {/* Password */}
          <Text className="text-white font-semibold mb-2 text-lg">
            Password
          </Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.inputClassy}
            className="mb-6"
          />

          {/* Sign Up button */}
          <TouchableOpacity
            onPress={handleSignup}
            className="bg-black py-4 rounded-2xl items-center flex-row justify-center"
          >
            <UserPlus size={22} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={() => router.push("../(auth)/login")}>
            <Text className="text-white font-medium">
              Already have an account?{" "}
              <Text className="text-blue-600 font-semibold">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  inputClassy: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1.5,
    borderColor: "black",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});
