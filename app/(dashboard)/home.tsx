import { auth, db } from "@/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data?.photoURL) setPhotoURL(data.photoURL);
        } else if (user.photoURL) {
          // fallback to Firebase Auth photoURL
          setPhotoURL(user.photoURL);
        }
      } catch (err) {
        console.error("Failed to fetch profile photo:", err);
      }
    };
    fetchProfilePhoto();
  }, [user]);

  return (
    <View className="flex-1 bg-white px-6 pt-14">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-3xl font-extrabold text-green-700">
          Dashboard
        </Text>

        <TouchableOpacity
          onPress={() => router.push("profiles/profile")}
          className="p-1"
        >
          {photoURL ? (
            <Image
              source={{ uri: photoURL }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#d1fae5",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#059669", fontWeight: "bold" }}>U</Text>
            </View>
          )}
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
