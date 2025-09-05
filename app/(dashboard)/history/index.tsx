// app/dashboard/history/index.tsx
import { historyRef } from "@/services/groceryService";
import { Grocery } from "@/types/grocery";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

  // group items by created date
  const groupedByDate: Record<string, Grocery[]> = {};
  history.forEach((item) => {
    const date = new Date(item.createdAt!).toLocaleDateString();
    if (!groupedByDate[date]) groupedByDate[date] = [];
    groupedByDate[date].push(item);
  });

  const toggleDate = (date: string) => {
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
          <View className="flex-row items-center mb-16">
            <MaterialIcons name="history" size={32} color="white" />
            <Text className="text-3xl font-bold text-white ml-3">History</Text>
          </View>

          {Object.keys(groupedByDate).map((date) => {
            const isExpanded = expandedDates.includes(date);
            return (
              <View key={date} className="mb-10">
                {/* Date Header */}
                <TouchableOpacity
                  onPress={() => toggleDate(date)}
                  className="bg-white rounded-2xl px-4 py-3 flex-row justify-between items-center border border-gray-300"
                >
                  <Text className="text-lg font-semibold text-black">
                    {date}
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={28}
                    color="black"
                    style={{
                      transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                    }}
                  />
                </TouchableOpacity>

                {/* Items */}
                {isExpanded &&
                  groupedByDate[date].map((item) => (
                    <View
                      key={item.id}
                      className="bg-white rounded-2xl p-4 mt-3 flex-row justify-between items-center shadow-md"
                    >
                      <View className="flex-row items-center gap-3 flex-1">
                        <FontAwesome5
                          name="shopping-basket"
                          size={20}
                          color="#16a34a"
                        />
                        <View>
                          <Text className="text-lg font-semibold text-black">
                            {item.name}
                          </Text>
                          <Text className="text-sm text-gray-800">
                            Qty: {item.quantity}
                          </Text>
                        </View>
                      </View>

                      {/* Status Badge */}
                      <View
                        className={`px-3 py-1 rounded-full ${
                          item.completed ? "bg-green-600" : "bg-yellow-500"
                        }`}
                      >
                        <Text className="text-white font-medium text-sm">
                          {item.completed ? "Completed" : "Pending"}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default HistoryScreen;
