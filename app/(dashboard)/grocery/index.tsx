import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import {
  deleteGrocery,
  groceriesRef,
  moveToHistory,
  updateGrocery,
} from "@/services/groceryService";
import { Grocery } from "@/types/grocery";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { onSnapshot } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
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
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { user, loading: authLoading } = useAuth();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setGroceries([]);
      setCompletedIds([]);
      return;
    }
    showLoader();
    let unsub: () => void = () => {};
    try {
      unsub = onSnapshot(
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
    } catch (e) {
      console.error("Grocery subscription error:", e);
      hideLoader();
    }
    return () => {
      try {
        unsub();
      } catch {}
    };
  }, [user, authLoading]);

  const progress = groceries.length
    ? (completedIds.length / groceries.length) * 100
    : 0;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const visibleGroceries = groceries.filter((g) => {
    if (filter === "completed") return completedIds.includes(g.id!);
    if (filter === "active") return !completedIds.includes(g.id!);
    return true;
  });

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

  const toggleComplete = async (id: string) => {
    // Find the grocery item
    const item = groceries.find((g) => g.id === id);
    if (!item) return;
    const newCompleted = !item.completed;
    try {
      showLoader();
      await updateGrocery(id, { completed: newCompleted });
      setGroceries((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, completed: newCompleted } : item
        )
      );
      setCompletedIds((prev) =>
        newCompleted ? [...prev, id] : prev.filter((i) => i !== id)
      );
    } catch (err) {
      console.error("Failed to update completed status:", err);
    } finally {
      hideLoader();
    }
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

  if (authLoading) {
    return <View style={{ flex: 1 }} />;
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0b1220",
        }}
      >
        <Text style={{ color: "#fff", marginBottom: 12, fontWeight: "700" }}>
          Please login to see your groceries
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: "#6366f1",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../../assets/images/purple.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "rgba(0,0,0,0.70)",
          }}
        />
        <View style={{ flex: 1, paddingHorizontal: 1, paddingTop: 30 }}>
          {/* Header */}
          <View className="p-5 flex-row justify-between items-center z-10">
            <View>
              <Text className="text-4xl font-extrabold text-white">
                Groceries
              </Text>
              <Text className="text-xs text-white/70 mt-1">
                {completedIds.length} of {groceries.length} completed
              </Text>
            </View>
            {/* Filter pills */}
            <View className="flex-row bg-white/10 rounded-full p-1">
              {(["all", "active", "completed"] as const).map((f) => {
                const active = f === filter;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setFilter(f)}
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${f} groceries`}
                    className={`px-3 py-1 rounded-full ${
                      active ? "bg-purple-600" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? "text-white" : "text-white/70"
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* List / Empty State */}
          {visibleGroceries.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <LinearGradient
                colors={["#6048e6", "#a866ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 2,
                  borderRadius: 24,
                  width: "100%",
                  maxWidth: 340,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.65)",
                    padding: 22,
                    borderRadius: 22,
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name="shopping-cart"
                    size={40}
                    color="#ffffff"
                    style={{ opacity: 0.8 }}
                  />
                  <Text className="text-white font-semibold text-lg mt-4">
                    {groceries.length === 0
                      ? "No groceries yet"
                      : "No items match this filter"}
                  </Text>
                  <Text className="text-white/60 text-center text-xs mt-2 leading-4">
                    Add items with the + button below to get started.
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <ScrollView
              className="mt-3 px-4 z-10"
              contentContainerStyle={{ paddingBottom: 140 }}
            >
              {visibleGroceries.map((item) => {
                const isDone = completedIds.includes(item.id!);
                return (
                  <View
                    key={item.id}
                    style={[styles.glassCard, { overflow: "hidden" }]}
                    className="mb-3"
                    accessibilityRole="summary"
                    accessibilityLabel={`${item.name}, quantity ${item.quantity}, ${
                      isDone ? "completed" : "active"
                    }`}
                  >
                    {/* Left status accent */}
                    <LinearGradient
                      colors={
                        isDone ? ["#16a34a", "#4ade80"] : ["#6366f1", "#8b5cf6"]
                      }
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 6,
                      }}
                    />
                    <View className="p-4 flex-row justify-between items-center">
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <Text
                          className={`text-lg font-semibold ${
                            isDone ? "text-green-300" : "text-white"
                          }`}
                          style={{
                            textDecorationLine: isDone
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-xs text-gray-200/70 mt-1">
                          Qty: {item.quantity}
                        </Text>
                        <View className="mt-2">
                          <Text
                            className={`text-[10px] tracking-wide px-2 py-1 rounded-full self-start ${
                              isDone
                                ? "bg-green-500/20 text-green-300"
                                : "bg-white/15 text-white/80"
                            }`}
                          >
                            {isDone ? "Completed" : "In progress"}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        {/* Edit */}
                        <TouchableOpacity
                          className="p-2 rounded-xl mr-2 bg-white/15"
                          onPress={() =>
                            router.push(`/(dashboard)/grocery/${item.id}`)
                          }
                          accessibilityLabel="Edit item"
                        >
                          <MaterialIcons name="edit" size={20} color="#fff" />
                        </TouchableOpacity>

                        {/* Delete */}
                        <TouchableOpacity
                          className="p-2 rounded-xl mr-3 bg-white/15"
                          onPress={() => confirmDelete(item.id!)}
                          accessibilityLabel="Delete item"
                        >
                          <MaterialIcons name="delete" size={20} color="#fff" />
                        </TouchableOpacity>

                        {/* Complete toggle */}
                        <Pressable
                          onPress={() => toggleComplete(item.id!)}
                          className={`rounded-full border-2 ${
                            isDone
                              ? "border-green-400 bg-green-500/30"
                              : "border-white/40 bg-white/10"
                          } p-2`}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isDone }}
                        >
                          <MaterialIcons
                            name="check"
                            size={18}
                            color={isDone ? "#bbf7d0" : "#ffffff"}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* action anf progress */}
          <View className="p-4 z-10">
            <TouchableOpacity
              className="py-4 rounded-2xl mb-4 flex-row justify-center items-center"
              onPress={handleFinishAll}
              disabled={!groceries.length}
              style={{
                opacity: groceries.length ? 1 : 0.4,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={["#7e22ce", "#9333ea", "#6366f1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  ...StyleSheet.absoluteFillObject,
                  borderRadius: 20,
                }}
              />
              <MaterialIcons name="done-all" size={22} color="#fff" />
              <Text className="ml-2 text-white font-semibold text-lg">
                Finish All
              </Text>
            </TouchableOpacity>

            <View
              className="h-5 bg-white/15 rounded-full overflow-hidden"
              style={{ padding: 2 }}
              onLayout={(e) => setBarWidth(e.nativeEvent.layout.width - 4)}
            >
              <Animated.View
                style={{
                  height: "100%",
                  width: barWidth
                    ? progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: [0, barWidth],
                      })
                    : 0,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#22c55e", "#16a34a", "#15803d"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
              <View
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                pointerEvents="none"
              >
                <Text className="text-white/80 text-[10px] font-semibold">
                  {Math.round(progress)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Floating Add Button */}
          <View className="absolute bottom-32 right-6 z-20">
            <Pressable
              className="rounded-full shadow-lg"
              onPress={() => router.push("/(dashboard)/grocery/new")}
              accessibilityLabel="Add new grocery"
              style={{ width: 66, height: 66 }}
            >
              <LinearGradient
                colors={["#000000", "#3f3f46"]}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialIcons name="add" size={32} color="#fff" />
              </LinearGradient>
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
