// app/dashboard/grocery/index.tsx
import { useLoader } from "@/context/LoaderContext";
import {
  deleteGrocery,
  groceriesRef,
  moveToHistory,
} from "@/services/groceryService";
import { Grocery } from "@/types/grocery";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
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
          completed: false,
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
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../assets/images/purple.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* Blur overlay on background image */}
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        {/* Dark overlay */}
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.70)",
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 1, paddingTop: 30 }}>
          {/* Header */}
          <View className="p-5 flex-row justify-between items-center z-10">
            <Text className="text-4xl font-extrabold text-white">
              Groceries
            </Text>
          </View>

          {/* Grocery List */}
          <ScrollView className="mt-3 px-4 z-10">
            {groceries.map((item) => (
              <View
                key={item.id}
                style={styles.glassCard}
                className={`p-4 mb-3 rounded-2xl shadow-lg ${
                  item.completed ? "border-green-500" : "border-gray-200"
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-semibold text-white">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-gray-200">
                      Qty: {item.quantity}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    {/* Edit Button */}
                    <TouchableOpacity
                      className="p-2 rounded-xl mr-2 bg-white/20"
                      onPress={() =>
                        router.push(`/(dashboard)/grocery/${item.id}`)
                      }
                    >
                      <MaterialIcons name="edit" size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* Delete Button */}
                    <TouchableOpacity
                      className="p-2 rounded-xl mr-4 bg-white/20"
                      onPress={() => confirmDelete(item.id!)}
                    >
                      <MaterialIcons name="delete" size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* Complete/Done Button */}
                    <TouchableOpacity
                      className={`px-3 py-2 rounded-xl flex-row items-center ${
                        item.completed ? "bg-green-600" : "bg-blue-600"
                      }`}
                      onPress={() => toggleComplete(item.id!)}
                      style={{ marginLeft: 12 }}
                    >
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color="#fff"
                      />
                      <Text className="ml-1 text-white font-semibold">
                        {item.completed ? "Done" : "Complete"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Section */}
          <View className="p-4 z-10">
            <TouchableOpacity
              className="bg-purple-700 py-4 rounded-2xl mb-3 flex-row justify-center items-center"
              onPress={handleFinishAll}
            >
              <MaterialIcons name="done-all" size={22} color="#fff" />
              <Text className="ml-2 text-white font-semibold text-lg">
                Finish All
              </Text>
            </TouchableOpacity>

            {/* Progress Bar */}
            <View className="h-4 bg-gray-400 rounded-full overflow-hidden">
              <View
                className="h-4 bg-green-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          </View>

          {/* Floating Add Button */}
          <View className="absolute bottom-24 right-6 z-20">
            <Pressable
              className="bg-black rounded-full mb-5 p-5 shadow-lg"
              onPress={() => router.push("/(dashboard)/grocery/new")}
            >
              <MaterialIcons name="add" size={28} color="#fff" />
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
});

export default GroceryListScreen;
