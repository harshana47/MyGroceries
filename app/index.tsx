// app/landing.tsx
import { router } from "expo-router";
import { LogIn, ShoppingCart, UserPlus } from "lucide-react-native";
import React from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

export default function Landing() {
  return (
    <ImageBackground
      source={require("../assets/images/image.png")} // add a nice grocery bg image here
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 bg-black/40 justify-center items-center p-6">
        {/* Logo & App Title */}
        <View className="items-center mb-10">
          <ShoppingCart size={60} color="white" />
          <Text className="text-4xl font-extrabold text-white mt-4">
            MyGroceries
          </Text>
          <Text className="text-gray-200 text-center mt-2">
            Shop smarter. Stay organized.
          </Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          onPress={() => router.push("../login")}
          className="flex-row items-center bg-blue-600 px-8 py-4 rounded-2xl mb-4 w-full justify-center shadow-lg"
        >
          <LogIn size={22} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("../signup")}
          className="flex-row items-center bg-green-600 px-8 py-4 rounded-2xl w-full justify-center shadow-lg"
        >
          <UserPlus size={22} color="white" />
          <Text className="text-white font-bold text-lg ml-2">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
