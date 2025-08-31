// app/dashboard/history/index.tsx
import { historyRef } from "@/services/groceryService";
import { Grocery } from "@/types/grocery";
import { MaterialIcons } from "@expo/vector-icons";
import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

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
    <ScrollView className="flex-1 bg-gray-50 p-4">
      {Object.keys(groupedByDate).map((date) => {
        const isExpanded = expandedDates.includes(date);
        return (
          <View key={date} className="mb-4">
            {/* Date Header */}
            <TouchableOpacity
              onPress={() => toggleDate(date)}
              className="bg-gray-200 p-3 rounded-xl flex-row justify-between items-center"
            >
              <Text className="text-xl font-bold">{date}</Text>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={24}
                style={{
                  transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                }}
              />
            </TouchableOpacity>

            {/* Items for the date */}
            {isExpanded &&
              groupedByDate[date].map((item) => (
                <View
                  key={item.id}
                  className="bg-white p-4 mb-2 rounded-xl shadow-sm border flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-lg font-semibold">{item.name}</Text>
                    <Text className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </Text>
                  </View>

                  {/* Status Badge */}
                  <View
                    className={`px-3 py-1 rounded-full ${
                      item.completed ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    <Text className="text-white text-sm">
                      {item.completed ? "Completed" : "Pending"}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default HistoryScreen;
