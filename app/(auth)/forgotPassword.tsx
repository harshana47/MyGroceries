import { auth } from "@/firebase";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { sendPasswordResetEmail } from "firebase/auth";
import { Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email.trim()) {
      setErrorMsg("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Enter a valid email.");
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg("Reset link sent. Check your inbox.");
      setEmail("");
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setErrorMsg(
        err?.code === "auth/user-not-found"
          ? "No account with that email."
          : err.message || "Failed to send reset email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/man2.jpg")}
      resizeMode="cover"
      style={{ flex: 1 }}
    >
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.overlay} />
      <Animated.View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 26,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.55)",
            "rgba(255,255,255,0.30)",
            "rgba(255,255,255,0.25)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shell}
        >
          <View style={styles.inner}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your account email to receive a reset link.
            </Text>

            {errorMsg && (
              <View style={[styles.badge, styles.errorBadge]}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}
            {successMsg && (
              <View style={[styles.badge, styles.successBadge]}>
                <Text style={styles.successText}>{successMsg}</Text>
              </View>
            )}

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <View style={styles.iconWrap}>
                <Mail size={18} color="#475569" />
              </View>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.inputField}
                returnKeyType="send"
                onSubmitEditing={handleResetPassword}
              />
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={loading || !email.trim()}
              activeOpacity={0.85}
              style={[
                styles.buttonWrapper,
                (loading || !email.trim()) && { opacity: 0.6 },
              ]}
            >
              <LinearGradient
                colors={["#18181b", "#27272a", "#3f3f46"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Email</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert("Info", "Return to login screen.")}
              style={{ marginTop: 18 }}
              disabled={loading}
            >
              <Text style={styles.backText}>
                Remember password? <Text style={styles.backLink}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </ImageBackground>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  shell: {
    borderRadius: 30,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 10,
  },
  inner: {
    borderRadius: 28,
    padding: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
    lineHeight: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.7)",
    overflow: "hidden",
    marginBottom: 22,
  },
  iconWrap: {
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 14,
    fontSize: 15.5,
    color: "#0f172a",
  },
  buttonWrapper: {
    borderRadius: 22,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  badge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  errorBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.45)",
  },
  successBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
    borderColor: "rgba(34,197,94,0.45)",
  },
  errorText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  successText: {
    color: "#1e3a8a",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.4,
  },
  backText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  backLink: {
    color: "#2563eb",
    fontWeight: "700",
  },
});
