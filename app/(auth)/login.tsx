// app/login.tsx
import { router } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { LogIn } from "lucide-react-native";
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
import { app } from "../../firebase"; // adjust if your firebase.ts exports app

const auth = getAuth(app);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/home"); // after login redirect to dashboard
    } catch (error: any) {
      Alert.alert("Login Error", error.message);
    }
  }

  return (
    // <ImageBackground
    //   source={require("../../assets/images/man3.jpg")}
    //   resizeMode="cover"
    //   style={{ flex: 1 }}
    // >
    //   <KeyboardAvoidingView
    //     behavior={Platform.OS === "ios" ? "padding" : undefined}
    //     className="flex-1 px-6 py-10 justify-between"
    //   >
    //     {/* Header */}
    //     <View className="items-center mt-12">
    //       <Text className="text-white text-5xl mt-4 font-extrabold">Login</Text>
    //       <Text className="text-white mt-4 text-base">
    //         Welcome back 👋 Sign in to continue
    //       </Text>
    //     </View>
    <ImageBackground
      source={require("../../assets/images/man.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      {/* Add a dark overlay */}
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
          <Text className="text-white text-5xl mt-4 font-extrabold">Login</Text>
          <Text className="text-white mt-4 text-base">
            Welcome back 👋 Sign in to continue
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
            className="mb-2"
          />

          {/* Forgot password */}
          <TouchableOpacity
            onPress={() => router.push("../(auth)/forgotPassword")}
            className="mb-6 mt-2"
          >
            <Text className="text-black text-right font-semibold underline">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-black py-4 rounded-2xl items-center flex-row justify-center space-x-2"
          >
            <LogIn size={22} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">Login</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={() => router.push("../signup")}>
            <Text className="text-white font-medium">
              Don’t have an account?{" "}
              <Text className="text-blue-600 font-semibold">Sign up</Text>
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
    backgroundColor: "rgba(255,255,255,0.85)", // more glassy
    borderWidth: 1.5,
    borderColor: "black",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000", // change to black text
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
});
