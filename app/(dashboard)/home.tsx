import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 bg-white px-6 pt-14">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-3xl font-extrabold text-green-700">
          Dashboard
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/profile")}
          className="p-2 bg-green-100 rounded-full"
        >
          <MaterialIcons name="person" size={28} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* Options */}
      <View className="flex-row justify-between mb-6">
        <TouchableOpacity
          onPress={() => router.push("/grocery")}
          className="flex-1 bg-green-600 mx-2 rounded-2xl p-6 justify-center items-center shadow-md"
        >
          <MaterialIcons name="shopping-cart" size={40} color="white" />
          <Text className="text-white font-bold mt-3 text-lg">Grocery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("maps/map")}
          className="flex-1 bg-blue-600 mx-2 rounded-2xl p-6 justify-center items-center shadow-md"
        >
          <MaterialIcons name="map" size={40} color="white" />
          <Text className="text-white font-bold mt-3 text-lg">Map</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center">
        <TouchableOpacity
          onPress={() => router.push("/history")}
          className="flex-1 bg-purple-600 mx-2 rounded-2xl p-6 justify-center items-center shadow-md"
        >
          <MaterialIcons name="history" size={40} color="white" />
          <Text className="text-white font-bold mt-3 text-lg">History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
