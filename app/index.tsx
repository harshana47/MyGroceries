// app/landing.tsx
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CheckCircle2,
  LogIn,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UserPlus,
} from "lucide-react-native";
import React from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Landing() {
  // Animations
  const headerAnim = React.useRef(new Animated.Value(0)).current;
  const cardAnim = React.useRef(new Animated.Value(0)).current;
  const footerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.stagger(140, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(footerAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/man.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      {/* Gradient overlay layer */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.75)"]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{ flex: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-6 py-10 justify-between"
      >
        {/* Header / Logo */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          }}
          className="items-center mt-14"
        >
          <View
            style={{
              padding: 20,
              borderRadius: 32,
              backgroundColor: "rgba(255,255,255,0.08)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <ShoppingCart size={68} color="white" />
          </View>
          <Text className="text-white text-5xl font-extrabold mt-1 tracking-tight">
            MyGroceries
          </Text>
          <Text className="text-white/80 text-center mt-2 text-base leading-5">
            Shop smarter. Stay organized.
          </Text>
        </Animated.View>

        {/* main Card */}
        <Animated.View
          style={{
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.55)",
              "rgba(255,255,255,0.38)",
              "rgba(255,255,255,0.32)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassOuter}
          >
            <View style={styles.glassInner}>
              <Text
                style={{
                  fontSize: 30,
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: 6,
                  letterSpacing: 0.5,
                }}
              >
                Welcome 👋
              </Text>
              <Text
                style={{
                  color: "#374151",
                  fontSize: 15,
                  fontWeight: "500",
                  lineHeight: 22,
                  marginBottom: 2,
                }}
              >
                Your smart grocery companion. Start exploring and organizing
                now!
              </Text>

              {/*feature bullets */}
              <View style={{ marginBottom: 20 }}>
                {[
                  {
                    icon: <CheckCircle2 size={18} color="#059669" />,
                    text: "Track & complete items effortlessly",
                  },
                  {
                    icon: <Sparkles size={18} color="#7e22ce" />,
                    text: "Modern, fast & intuitive experience",
                  },
                  {
                    icon: <ShieldCheck size={18} color="#2563eb" />,
                    text: "Secure & synced with the cloud",
                  },
                ].map((f, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <View style={styles.featureIconWrap}>{f.icon}</View>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>

              {/* login Button */}
              <TouchableOpacity
                onPress={() => router.push("../login")}
                activeOpacity={0.85}
                style={styles.primaryButton}
              >
                <LinearGradient
                  colors={["#18181b", "#27272a", "#3f3f46"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryGradient}
                >
                  <LogIn size={22} color="white" />
                  <Text style={styles.primaryButtonText}>Login</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* sign Up Button */}
              <TouchableOpacity
                onPress={() => router.push("../signup")}
                activeOpacity={0.85}
                style={styles.secondaryButton}
              >
                <LinearGradient
                  colors={["#7e22ce", "#9333ea", "#a855f7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.secondaryGradient}
                >
                  <UserPlus size={22} color="#fff" />
                  <Text style={styles.secondaryButtonText}>Sign Up</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* footer */}
        <Animated.View
          style={{
            opacity: footerAnim,
            transform: [
              {
                translateY: footerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          }}
          className="items-center mb-6"
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.72)",
              fontSize: 13,
              letterSpacing: 0.6,
            }}
          >
            Organize your groceries with ease 🛒
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    // (kept for reference if used elsewhere)
    backgroundColor: "rgba(255,255,255,0.59)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  glassOuter: {
    borderRadius: 28,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
    marginBottom: 8,
  },
  glassInner: {
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.55)",
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 13.5,
    color: "#374151",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  primaryButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
  },
  primaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 20,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  secondaryGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 20,
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
});
