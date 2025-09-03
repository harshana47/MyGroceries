// app/landing.tsx
import { router } from "expo-router";
import { LogIn, ShoppingCart, UserPlus } from "lucide-react-native";
import React from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Landing() {
  return (
    <ImageBackground
      source={require("../assets/images/man.jpg")} // same background as login
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-6 py-10 justify-between"
      >
        {/* Header / Logo */}
        <View className="items-center mt-14">
          <View className="p-6 rounded-3xl">
            <ShoppingCart size={80} color="white" />
          </View>
          <Text className="text-white text-5xl font-extrabold">
            MyGroceries
          </Text>
          <Text className="text-white text-center mt-1 text-base">
            Shop smarter. Stay organized.
          </Text>
        </View>

        {/* Main Card */}
        <View
          style={styles.glassCard}
          className="rounded-3xl p-8 mb-4 shadow-lg"
        >
          <Text className="text-black text-3xl font-bold mb-2">Welcome 👋</Text>
          <Text className="text-gray-1000  text-base font-semibold mb-6">
            Your smart grocery companion. Start exploring and organizing now!
          </Text>

          {/* Login Button */}
          <TouchableOpacity
            onPress={() => router.push("../login")}
            className="flex-row items-center bg-black px-6 py-4 rounded-2xl mb-4 justify-center"
          >
            <LogIn size={22} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">Login</Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={() => router.push("../signup")}
            className="flex-row items-center bg-black px-6 py-4 rounded-2xl justify-center"
          >
            <UserPlus size={22} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mb-6">
          <Text className="text-white/80 text-m">
            Organize your groceries with ease 🛒
          </Text>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.59)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
});
