// app/login.tsx
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { app } from "../../firebase"; // adjust if your firebase.ts exports app

const auth = getAuth(app);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const headerAnim = React.useRef(new Animated.Value(1)).current;
  const formAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.stagger(160, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(formAnim, {
        toValue: 1,
        friction: 9,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Email and password required.");
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(dashboard)/home");
    } catch (error: any) {
      setErrorMsg(
        error?.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : error.message || "Login failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require("../../assets/images/man.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      {/* Add a dark overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 1,
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 px-6 py-10 justify-between"
        style={{ zIndex: 2 }}
      >
        {/* Header */}
        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [28, 0],
                }),
              },
            ],
          }}
          className="items-center mt-16"
        >
          <Text className="text-white text-5xl font-extrabold tracking-tight">
            Login
          </Text>
          <Text className="text-white/80 mt-4 text-base">
            Welcome back 👋 Sign in to continue
          </Text>
        </Animated.View>

        {/* Main Card */}
        <Animated.View
          style={{
            opacity: formAnim,
            transform: [
              {
                translateY: formAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [42, 0],
                }),
              },
              {
                scale: formAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          }}
          className="mt-2 mb-8"
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.20)",
              "rgba(255,255,255,0.25)",
              "rgba(255,255,255,0.28)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.glassOuter}
          >
            <View style={styles.glassInner}>
              {/* Error Message */}
              {errorMsg && (
                <View style={styles.errorBadge}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Email */}
              <Text className="text-white font-semibold mb-2 text-lg">
                Email
              </Text>
              <View style={styles.inputRow}>
                <View style={styles.iconLeft}>
                  <Mail size={18} color="#475569" />
                </View>
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.inputField}
                  returnKeyType="next"
                />
              </View>

              {/* Password */}
              <Text className="text-white font-semibold mb-2 text-lg mt-5">
                Password
              </Text>
              <View style={styles.inputRow}>
                <View style={styles.iconLeft}>
                  <Lock size={18} color="#475569" />
                </View>
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.inputField}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.togglePassBtn}
                  hitSlop={10}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#475569" />
                  ) : (
                    <Eye size={18} color="#475569" />
                  )}
                </Pressable>
              </View>

              {/* Forgot password */}
              <Pressable
                onPress={() => router.push("../(auth)/forgotPassword")}
                style={{
                  alignSelf: "flex-end",
                  marginTop: 12,
                  marginBottom: 26,
                }}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>

              {/* Login button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                style={[styles.primaryButton, loading && { opacity: 0.7 }]}
              >
                <LinearGradient
                  colors={["#18181b", "#27272a", "#3f3f46"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <LogIn size={22} color="white" />
                      <Text style={styles.primaryButtonText}>Login</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Footer */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={() => router.push("../signup")}>
            <Text style={styles.footerText}>
              Don’t have an account?{" "}
              <Text style={styles.footerLink}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  glassOuter: {
    borderRadius: 30,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
  },
  glassInner: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    padding: 26,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.75)",
    paddingRight: 8,
  },
  iconLeft: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15.5,
    color: "#0f172a",
  },
  togglePassBtn: {
    padding: 8,
    borderRadius: 14,
  },
  forgotText: {
    color: "#020617",
    fontWeight: "600",
    fontSize: 13,
    textDecorationLine: "underline",
    letterSpacing: 0.3,
  },
  primaryButton: {
    borderRadius: 22,
    overflow: "hidden",
  },
  primaryGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 22,
    gap: 8,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  errorBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.45)",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 18,
  },
  errorText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  footerText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  footerLink: {
    color: "#2563eb",
    fontWeight: "700",
  },
  // existing inputClassy kept if used elsewhere
});
