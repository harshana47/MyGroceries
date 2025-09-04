import { auth, db } from "@/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Utility to convert hex or named colors to rgba with opacity
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
  // fallback
  return `rgba(255,255,255,${opacity})`;
};

// Reusable animated card component
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
            backgroundColor: getRgba(color, 0.6),
            transform: [{ scale }],
            shadowOpacity: 0.12,
            shadowRadius: 20,
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
      {/* Dark overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.48)",
        }}
      />

      <View
        style={{ flex: 1, paddingHorizontal: 24, paddingTop: 12, zIndex: 2 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              borderWidth: 2,
              borderColor: "green",
              borderRadius: 24,
              padding: 4,
              backgroundColor: "rgba(34,197,94,0.10)",
              shadowColor: "#22c55e",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
            }}
          >
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                style={{ width: 42, height: 42, borderRadius: 21 }}
              />
            ) : (
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: "#d1fae5",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#059669", fontWeight: "bold" }}>U</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <View
          style={{
            position: "absolute",
            top: 110,
            left: 0,
            right: 0,
            zIndex: 10,
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: "800",
              color: "white",
              textAlign: "center",
            }}
          >
            Dashboard
          </Text>
        </View>

        {/* Cards */}
        <View style={{ flex: 1, marginTop: 140 }}>
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
    borderColor: "rgba(255,255,255,0.4)",
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
