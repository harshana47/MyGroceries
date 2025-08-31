// app/dashboard/grocery/[id].tsx
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import {
  createGrocery,
  getGroceryById,
  updateGrocery,
} from "@/services/groceryService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

const GroceryFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === "new";
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { user } = useAuth();

  useEffect(() => {
    const load = async () => {
      if (!isNew && id) {
        try {
          showLoader();
          const grocery = await getGroceryById(id);
          if (grocery) {
            setName(grocery.name);
            setQuantity(String(grocery.quantity));
          }
        } finally {
          hideLoader();
        }
      }
    };
    load();
  }, [id]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    try {
      showLoader();
      if (isNew) {
        await createGrocery({
          name,
          quantity: Number(quantity),
          userId: user?.uid,
        });
      } else {
        await updateGrocery(id, { name, quantity: Number(quantity) });
      }
      router.back();
    } catch (err) {
      console.error(`Error ${isNew ? "saving" : "updating"} grocery`, err);
      Alert.alert("Error", `Failed to ${isNew ? "save" : "update"} grocery`);
    } finally {
      hideLoader();
    }
  };

  return (
    <View className="flex-1 bg-gray-50 p-5">
      <Text className="text-2xl font-bold text-gray-800 mb-4">
        {isNew ? "Add Grocery" : "Edit Grocery"}
      </Text>

      <TextInput
        placeholder="Name"
        className="border border-gray-300 bg-white p-3 my-2 rounded-xl"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Quantity"
        keyboardType="numeric"
        className="border border-gray-300 bg-white p-3 my-2 rounded-xl"
        value={quantity}
        onChangeText={setQuantity}
      />

      <TouchableOpacity
        className="bg-blue-600 rounded-xl px-6 py-3 my-4"
        onPress={handleSubmit}
      >
        <Text className="text-lg text-white font-semibold text-center">
          {isNew ? "Add Grocery" : "Update Grocery"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default GroceryFormScreen;
