// app/dashboard/grocery/[id].tsx
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import {
  createGrocery,
  getGroceryById,
  updateGrocery,
} from "@/services/groceryService";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
    <ImageBackground
      source={require("../../../assets/images/man3.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      />

      <View className="flex-1 justify-center items-center px-6">
        {/* Card */}
        <View style={styles.card} className="w-full p-6 rounded-2xl">
          {/* Icon + Header */}
          <View className="flex-row items-center mb-6">
            <View style={styles.iconCircle}>
              <ShoppingCart size={26} color="#fff" />
            </View>
            <Text className="text-2xl font-extrabold text-gray-800 ml-3">
              {isNew ? "Add Grocery" : "Edit Grocery"}
            </Text>
          </View>

          {/* Inputs */}
          <TextInput
            placeholder="Grocery Name"
            placeholderTextColor="#888"
            className="bg-white border border-gray-300 p-3 my-2 rounded-xl text-gray-900"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Quantity"
            placeholderTextColor="#888"
            keyboardType="numeric"
            className="bg-white border border-gray-300 p-3 my-2 rounded-xl text-gray-900"
            value={quantity}
            onChangeText={setQuantity}
          />

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            className="rounded-xl px-6 py-4 my-4"
            onPress={handleSubmit}
          >
            <Text className="text-lg text-white font-semibold text-center">
              {isNew ? "Add Grocery" : "Update Grocery"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconCircle: {
    backgroundColor: "#000000", // black theme for groceries
    padding: 10,
    borderRadius: 10,
  },
  submitBtn: {
    backgroundColor: "#000000", // black button
  },
});

export default GroceryFormScreen;
