// app/dashboard/history/index.tsx
import { historyRef } from "@/services/groceryService";
import { Grocery } from "@/types/grocery";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HistoryScreen = () => {
  const [history, setHistory] = useState<Grocery[]>([]);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(historyRef(), (snap) => {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Grocery[];
      setHistory(items);
    });
    return () => unsub();
  }, []);

  // group + sort by date (newest first)
  const groupedByDate: Record<string, Grocery[]> = {};
  history.forEach((item) => {
    const dateObj = item.createdAt
      ? new Date(item.createdAt as any)
      : new Date();
    const dateLabel = dateObj.toLocaleDateString();
    if (!groupedByDate[dateLabel]) groupedByDate[dateLabel] = [];
    groupedByDate[dateLabel].push(item);
  });
  const dateKeys = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const toggleDate = (date: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/closed3.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Blur overlay */}
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      {/* Dark overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      />
      <View className="flex-1">
        <ScrollView className="flex-1 p-4 mt-14">
          {/* Header */}
          <View className="flex-row items-center mb-10">
            <MaterialIcons name="history" size={32} color="white" />
            <Text className="text-3xl font-bold text-white ml-3">History</Text>
          </View>

          {/* Empty State */}
          {dateKeys.length === 0 && (
            <View
              style={{
                marginTop: 80,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LinearGradient
                colors={["#6366f1", "#8b5cf6", "#a855f7"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: 2,
                  borderRadius: 28,
                  width: "92%",
                  maxWidth: 380,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(0,0,0,0.55)",
                    padding: 28,
                    borderRadius: 26,
                    alignItems: "center",
                  }}
                >
                  <FontAwesome5
                    name="shopping-basket"
                    size={42}
                    color="white"
                    style={{ opacity: 0.85 }}
                  />
                  <Text className="text-white font-semibold text-lg mt-5">
                    No History Yet
                  </Text>
                  <Text className="text-white/70 text-xs mt-2 text-center leading-5">
                    Completed grocery lists will appear here after you finish
                    them.
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Date Groups */}
          {dateKeys.map((date) => {
            const items = groupedByDate[date];
            const isExpanded = expandedDates.includes(date);
            const completedCount = items.filter((i) => i.completed).length;
            return (
              <View key={date} className="mb-8">
                {/* Date Header */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => toggleDate(date)}
                  style={{ borderRadius: 22, overflow: "hidden" }}
                >
                  <LinearGradient
                    colors={
                      isExpanded
                        ? ["#4f46e5", "#7c3aed", "#9333ea"]
                        : ["#334155", "#475569", "#64748b"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "white",
                          letterSpacing: 0.5,
                        }}
                      >
                        {date}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          marginTop: 4,
                          color: "rgba(255,255,255,0.75)",
                          fontWeight: "500",
                        }}
                      >
                        {completedCount}/{items.length} completed
                      </Text>
                    </View>
                    <View
                      style={{
                        backgroundColor: "rgba(255,255,255,0.15)",
                        padding: 8,
                        borderRadius: 14,
                      }}
                    >
                      <MaterialIcons
                        name="keyboard-arrow-down"
                        size={26}
                        color="#fff"
                        style={{
                          transform: [
                            { rotate: isExpanded ? "180deg" : "0deg" },
                          ],
                        }}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Items */}
                {isExpanded &&
                  items.map((item) => {
                    const done = item.completed;
                    return (
                      <View
                        key={item.id}
                        style={{
                          marginTop: 10,
                          borderRadius: 20,
                          padding: 14,
                          backgroundColor: "rgba(255,255,255,0.08)",
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.12)",
                          flexDirection: "row",
                          alignItems: "center",
                          shadowColor: "#000",
                          shadowOpacity: 0.25,
                          shadowRadius: 10,
                          shadowOffset: { width: 0, height: 4 },
                          overflow: "hidden",
                        }}
                      >
                        {/* Accent bar */}
                        <View
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 5,
                            backgroundColor: done ? "#16a34a" : "#f59e0b",
                          }}
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 1,
                            paddingLeft: 12,
                          }}
                        >
                          <FontAwesome5
                            name="shopping-basket"
                            size={18}
                            color={done ? "#16a34a" : "#fbbf24"}
                            style={{ marginRight: 14 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: "white",
                                fontWeight: "600",
                                fontSize: 15,
                                textDecorationLine: done
                                  ? "line-through"
                                  : "none",
                              }}
                            >
                              {item.name}
                            </Text>
                            <Text
                              style={{
                                color: "rgba(255,255,255,0.65)",
                                fontSize: 12,
                                marginTop: 3,
                                letterSpacing: 0.3,
                              }}
                            >
                              Qty: {item.quantity}
                            </Text>
                          </View>
                          <View
                            style={{
                              backgroundColor: done
                                ? "rgba(34,197,94,0.18)"
                                : "rgba(234,179,8,0.18)",
                              borderColor: done
                                ? "rgba(34,197,94,0.55)"
                                : "rgba(234,179,8,0.55)",
                              borderWidth: 1,
                              paddingVertical: 4,
                              paddingHorizontal: 10,
                              borderRadius: 999,
                            }}
                          >
                            <Text
                              style={{
                                color: done ? "#4ade80" : "#fbbf24",
                                fontSize: 11,
                                fontWeight: "600",
                                letterSpacing: 0.5,
                              }}
                            >
                              {done ? "COMPLETED" : "PENDING"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default HistoryScreen;
