// app/dashboard/grocery/index.tsx
import { useLoader } from "@/context/LoaderContext";
import {
  deleteGrocery,
  groceriesRef,
  moveToHistory,
} from "@/services/groceryService";
import { Grocery } from "@/types/grocery";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GroceryListScreen = () => {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    const unsub = onSnapshot(
      groceriesRef(),
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          completed: false, // track completion locally
        })) as Grocery[];
        setGroceries(items);
        hideLoader();
      },
      (err) => {
        console.error("Error fetching groceries:", err);
        hideLoader();
      }
    );
    return () => unsub();
  }, []);

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Grocery", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(id) },
    ]);
  };

  const handleDelete = async (id: string) => {
    try {
      showLoader();
      await deleteGrocery(id);
      setGroceries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      hideLoader();
    }
  };

  const toggleComplete = (id: string) => {
    setGroceries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFinishAll = async () => {
    if (!groceries.length) return;
    try {
      showLoader();
      await moveToHistory(groceries);
      setGroceries([]);
      setCompletedIds([]);
      Alert.alert("Success", "All groceries moved to history!");
      router.push("/home");
    } catch (err) {
      console.error("Finish all failed:", err);
      Alert.alert("Error", "Failed to finish all groceries.");
    } finally {
      hideLoader();
    }
  };

  const progress = groceries.length
    ? (completedIds.length / groceries.length) * 100
    : 0;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-5 flex-row justify-between items-center bg-white shadow">
        <Text className="text-2xl font-bold text-gray-800">Groceries</Text>
      </View>

      <ScrollView className="mt-3 px-4">
        {groceries.map((item) => (
          <View
            key={item.id}
            className={`p-4 mb-3 rounded-2xl shadow-sm border flex-row justify-between items-center ${
              item.completed ? "bg-green-100" : "bg-white"
            }`}
          >
            <View>
              <Text className="text-lg font-semibold text-gray-800">
                {item.name}
              </Text>
              <Text className="text-sm text-gray-500">
                Qty: {item.quantity}
              </Text>
            </View>

            <View className="flex-row items-center space-x-2">
              <TouchableOpacity
                className="bg-yellow-400 px-3 py-1 rounded-lg"
                onPress={() => router.push(`/(dashboard)/grocery/${item.id}`)}
              >
                <Text className="text-gray-800">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-3 py-1 rounded-lg ${
                  item.completed ? "bg-green-500" : "bg-blue-500"
                }`}
                onPress={() => toggleComplete(item.id!)}
              >
                <Text className="text-white">
                  {item.completed ? "Completed" : "Complete"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-red-500 px-3 py-1 rounded-lg"
                onPress={() => confirmDelete(item.id!)}
              >
                <Text className="text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Finish All Button */}
      <View className="p-4 bg-white">
        <TouchableOpacity
          className="bg-purple-600 py-3 rounded-xl mb-2"
          onPress={handleFinishAll}
        >
          <Text className="text-center text-white font-semibold text-lg">
            Finish All
          </Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View className="h-4 bg-gray-300 rounded-full">
          <View
            className="h-4 bg-green-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>

      {/* Floating Add Button */}
      <View className="absolute bottom-24 right-6">
        <Pressable
          className="bg-blue-600 rounded-full p-5 shadow-lg"
          onPress={() => router.push("/(dashboard)/grocery/new")}
        >
          <MaterialIcons name="add" size={28} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

export default GroceryListScreen;
