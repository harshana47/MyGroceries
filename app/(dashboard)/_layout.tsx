import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

const tabs = [
  { name: "home", label: "Home", icon: "home-filled" },
  { name: "grocery", label: "Grocery", icon: "shopping-cart" },
  { name: "maps/map", label: "Map", icon: "map" },
  { name: "history/index", label: "History", icon: "history" },
  { name: "profiles/profile", label: "Profile", icon: "person" },
  { name: "support/index", label: "Support", icon: "support" },
] as const;

export default function DashboardLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "#f8fafc",
          borderTopWidth: 0,
          elevation: 4,
        },
      }}
    >
      {tabs.map(({ name, icon, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name={icon as any} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
