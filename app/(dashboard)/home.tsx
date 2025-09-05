import { auth, db } from "@/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

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

// Reusable animated card
const AnimatedCard = ({
  color,
  icon,
  label,
  onPress,
  iconColor,
  textColor,
}: {
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor?: string;
  textColor?: string;
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
          styles.card,
          {
            backgroundColor: getRgba(color, 0.95),
            transform: [{ scale }],
          },
        ]}
      >
        <MaterialIcons name={icon} size={36} color={iconColor || "white"} />
        <Text
          style={[styles.cardText, textColor ? { color: textColor } : null]}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default function Home() {
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const user = auth.currentUser;

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
      {/* StatusBar with black background */}
      <StatusBar backgroundColor="black" barStyle="light-content" />

      {/* Overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.55)",
        }}
      />

      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 30 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "white",
              letterSpacing: 1,
            }}
          >
            My Space
          </Text>

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
              <Image
                source={{ uri: photoURL }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
              />
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
        <View style={{ flex: 1, marginTop: 30 }}>
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <AnimatedCard
              color="black"
              icon="shopping-cart"
              label="Grocery"
              onPress={() => router.push("/grocery")}
            />
            <AnimatedCard
              color="#d7d9db"
              icon="map"
              label="Map"
              onPress={() => router.push("maps/map")}
              iconColor="#000"
              textColor="#000"
            />
          </View>

          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <AnimatedCard
              color="#d7d9db"
              icon="history"
              label="History"
              onPress={() => router.push("/history")}
              iconColor="#000"
              textColor="#000"
            />
            <AnimatedCard
              color="black"
              icon="person"
              label="Profile"
              onPress={() => router.push("/profiles/profile")}
            />
          </View>

          <View style={{ flexDirection: "row" }}>
            <AnimatedCard
              color="#0ea5e9"
              icon="support"
              label="Support"
              onPress={() => router.push("/support")}
            />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    marginHorizontal: 8,
    padding: 24,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  cardText: {
    marginTop: 6,
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
