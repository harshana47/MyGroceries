import { auth, db } from "@/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const CARD_MIN_HEIGHT = 120;

const getRgba = (color: string, opacity: number) => {
  if (color.startsWith("#")) {
    const bigint = parseInt(color.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${opacity})`;
  }
  if (color === "black") return `rgba(0,0,0,${opacity})`;
  if (color === "white") return `rgba(255,255,255,${opacity})`;
  return `rgba(255,255,255,${opacity})`;
};

// animated card
const AnimatedCard = ({
  color,
  icon,
  label,
  onPress,
  iconColor,
  textColor,
  gradientColors,
}: {
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor?: string;
  textColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            minHeight: CARD_MIN_HEIGHT,
            transform: [{ scale }],
          },
        ]}
      >
        <LinearGradient
          colors={
            gradientColors || [
              getRgba(color, 0.85),
              getRgba(color === "black" ? "#1f2937" : color, 0.55),
            ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <MaterialIcons
              name={icon}
              size={36}
              color={iconColor || "white"}
              style={{ marginBottom: 6 }}
            />
            <Text
              style={[styles.cardText, textColor ? { color: textColor } : null]}
            >
              {label}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default function Home() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("");
  const user = auth.currentUser;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
    );
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

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
          setPhotoURL(user.photoURL);
        }
      } catch (err) {
        console.error("Failed to fetch profile photo:", err);
      }
    };
    fetchProfilePhoto();
  }, [user]);

  return (
    <ImageBackground
      source={require("../../assets/images/girl3.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* status Bar with black background */}
      <StatusBar backgroundColor="black" barStyle="light-content" />

      {/* Overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      />

      <Animated.View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          paddingTop: 54,
          opacity: fadeIn,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 34,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.65)",
                letterSpacing: 0.5,
                fontWeight: "500",
              }}
            >
              {greeting}
            </Text>
            <Text
              style={{
                fontSize: 34,
                fontWeight: "800",
                color: "white",
                letterSpacing: 1,
                marginTop: 2,
              }}
            >
              My Space
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                marginTop: 6,
                letterSpacing: 0.5,
              }}
            >
              Manage your daily essentials effortlessly
            </Text>
          </View>

          <View
            style={{
              borderWidth: 2,
              borderColor: "#0ea5e9",
              borderRadius: 28,
              padding: 3,
              shadowColor: "#0ea5e9",
              shadowOpacity: 0.4,
              shadowRadius: 6,
            }}
          >
            {photoURL ? (
              <Pressable onPress={() => router.push("/profiles")}>
                <Image
                  source={{ uri: photoURL }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              </Pressable>
            ) : (
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#d1fae5",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#0ea5e9", fontWeight: "bold" }}>U</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cards */}
        <View style={{ flex: 1, marginTop: 10 }}>
          <View style={{ flexDirection: "row", marginBottom: 18 }}>
            <AnimatedCard
              color="black"
              gradientColors={["#111827", "#1e293b", "#4c1d95"]}
              icon="shopping-cart"
              label="Grocery"
              onPress={() => router.push("/grocery")}
            />
            <AnimatedCard
              color="#d7d9db"
              gradientColors={["#f1f5f9", "#e2e8f0", "#cbd5e1"]}
              icon="map"
              label="Map"
              onPress={() => router.push("/map")}
              iconColor="#000"
              textColor="#111"
            />
          </View>

          <View style={{ flexDirection: "row", marginBottom: 18 }}>
            <AnimatedCard
              color="#d7d9db"
              gradientColors={["#f8fafc", "#e2e8f0", "#cbd5e1"]}
              icon="history"
              label="History"
              onPress={() => router.push("/history")}
              iconColor="#000"
              textColor="#111"
            />
            <AnimatedCard
              color="black"
              gradientColors={["#0f172a", "#1e293b", "#334155"]}
              icon="person"
              label="Profile"
              onPress={() => router.push("/profile")}
            />
          </View>

          <View style={{ flexDirection: "row" }}>
            <AnimatedCard
              color="#0ea5e9"
              gradientColors={["#0369a1", "#1e293b", "#0f172a"]}
              icon="support"
              label="Support"
              onPress={() => router.push("/support")}
            />
          </View>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
    minHeight: CARD_MIN_HEIGHT,
    overflow: "hidden",
  },
  cardGradient: {
    flex: 1,
    borderRadius: 22,
    padding: 1,
    height: "100%",
  },
  cardContent: {
    flex: 1,
    borderRadius: 21,
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardText: {
    marginTop: 6,
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
