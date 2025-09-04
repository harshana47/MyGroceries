// app/support/support.tsx
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Support() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/help1.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Overlay to make cards pop */}
      <View className="absolute inset-0 bg-black/40 border-r-8" />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 58 }}
        className="flex-1"
      >
        <Text className="text-3xl text-white font-extrabold mb-6 mt-10 pb-10">
          Support Center
        </Text>

        {/* Instructions */}
        <BlurView
          intensity={90}
          tint="light"
          className="mb-4 rounded-3xl border border-white/25 p-4 shadow-lg"
        >
          <TouchableOpacity
            className="flex-row justify-between items-center"
            onPress={() => toggleSection("instructions")}
          >
            <View className="flex-row items-center space-x-3">
              <Ionicons name="document-text" size={28} color="#22c55e" />
              <Text className="text-lg font-semibold text-gray-900 pl-2">
                Instructions
              </Text>
            </View>
            {openSection === "instructions" ? (
              <MaterialIcons name="keyboard-arrow-up" size={28} color="#111" />
            ) : (
              <MaterialIcons
                name="keyboard-arrow-down"
                size={28}
                color="#111"
              />
            )}
          </TouchableOpacity>
          {openSection === "instructions" && (
            <View className="mt-3">
              <Text className="text-gray-800 text-base leading-6 font-semibold pl-3">
                1. Login or Sign up to start using the app.{"\n"}
                2. Add groceries using the Grocery tab.{"\n"}
                3. Track your history and view map locations.{"\n"}
                4. Visit your profile to manage account settings.
              </Text>
            </View>
          )}
        </BlurView>

        {/* Feedback */}
        <BlurView
          intensity={90}
          tint="light"
          className="mb-4 rounded-3xl border border-white/25 p-4 shadow-lg"
        >
          <TouchableOpacity
            className="flex-row justify-between items-center"
            onPress={() => toggleSection("feedback")}
          >
            <View className="flex-row items-center space-x-3">
              <FontAwesome5 name="comment-dots" size={24} color="#3b82f6" />
              <Text className="text-lg font-semibold text-gray-900 pl-2">
                Feedback
              </Text>
            </View>
            {openSection === "feedback" ? (
              <MaterialIcons name="keyboard-arrow-up" size={28} color="#111" />
            ) : (
              <MaterialIcons
                name="keyboard-arrow-down"
                size={28}
                color="#111"
              />
            )}
          </TouchableOpacity>
          {openSection === "feedback" && (
            <View className="mt-3">
              <Text className="text-gray-800 text-base leading-6 font-semibold pl-3">
                We value your feedback! Please share your suggestions or report
                any issues you encounter.
              </Text>
            </View>
          )}
        </BlurView>

        {/* Contact Us */}
        <BlurView
          intensity={90}
          tint="light"
          className="rounded-3xl border border-white/25 p-4 shadow-lg"
        >
          <View className="flex-row items-center space-x-3 mb-2">
            <MaterialIcons name="call" size={28} color="#f59e0b" />
            <Text className="text-lg font-semibold text-gray-900 pl-2">
              Contact Us
            </Text>
          </View>
          <View>
            <Text className="text-gray-800 text-base leading-6 font-semibold pl-3">
              Email: support@example.com
            </Text>
            <Text className="text-gray-800 text-base leading-6 font-semibold pl-3">
              Phone: +123 456 7890
            </Text>
            <Text className="text-gray-800 text-base leading-6 font-semibold pl-3">
              Address: 123 Main Street, City, Country
            </Text>
            <Text className="text-gray-800 text-base leading-6 font-semibold pl-3">
              Website: www.mygroceryapp.com
            </Text>
          </View>
        </BlurView>
      </ScrollView>
    </ImageBackground>
  );
}
