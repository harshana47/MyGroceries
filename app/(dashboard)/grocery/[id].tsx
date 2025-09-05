// app/dashboard/grocery/[id].tsx
import { useAuth } from "@/context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import {
  createGrocery,
  getGroceryById,
  updateGrocery,
} from "@/services/groceryService";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ShoppingCart as CartIcon,
  Package,
  ShoppingCart,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
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

const GroceryFormScreen = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isNew = !id || id === "new";
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const { user } = useAuth();
  const formAnim = React.useRef(new Animated.Value(0)).current;
  const btnScale = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const load = async () => {
      if (!isNew && id) {
        try {
          showLoader();
          const grocery = await getGroceryById(id);
          if (grocery) {
            setName(grocery.name);
            setQuantity(String(grocery.quantity));
          }
        } finally {
          hideLoader();
        }
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }
    const qtyNum = Number(quantity);
    if (!quantity.trim() || isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg("Enter a valid quantity (> 0).");
      return;
    }

    try {
      showLoader();
      if (isNew) {
        await createGrocery({
          name,
          quantity: Number(quantity),
          userId: user?.uid,
        });
      } else {
        await updateGrocery(id, { name, quantity: Number(quantity) });
      }
      router.back();
    } catch (err) {
      console.error(`Error ${isNew ? "saving" : "updating"} grocery`, err);
      Alert.alert("Error", `Failed to ${isNew ? "save" : "update"} grocery`);
    } finally {
      hideLoader();
    }
  };

  const animatePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.94, useNativeDriver: true }).start();
  const animatePressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();

  return (
    <ImageBackground
      source={require("../../../assets/images/image.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.45)",
        }}
      />

      <View className="flex-1 justify-center items-center px-6">
        {/* Rebuilt Card */}
        <Animated.View
          style={{
            width: "100%",
            opacity: formAnim,
            transform: [
              {
                translateY: formAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
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
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0.25)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientShell}
          >
            <View style={styles.innerCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.iconCircleModern}>
                  <ShoppingCart size={24} color="#fff" />
                </View>
                <Text style={styles.titleText}>
                  {isNew ? "Add Grocery" : "Edit Grocery"}
                </Text>
              </View>

              {errorMsg && (
                <View style={styles.errorBadge}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Name Input */}
              <Text style={styles.label}>Name</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputIconWrap}>
                  <CartIcon size={18} color="#475569" />
                </View>
                <TextInput
                  placeholder="Grocery name"
                  placeholderTextColor="#64748b"
                  style={styles.inputField}
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                />
              </View>

              {/* Quantity Input */}
              <Text style={[styles.label, { marginTop: 18 }]}>Quantity</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputIconWrap}>
                  <Package size={18} color="#475569" />
                </View>
                <TextInput
                  placeholder="e.g. 3"
                  placeholderTextColor="#64748b"
                  style={styles.inputField}
                  value={quantity}
                  keyboardType="numeric"
                  onChangeText={setQuantity}
                  returnKeyType="done"
                />
              </View>

              {/* Submit */}
              <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPressIn={animatePressIn}
                  onPressOut={animatePressOut}
                  onPress={handleSubmit}
                  disabled={!name.trim() || !quantity.trim()}
                  style={[
                    styles.submitTouchable,
                    (!name.trim() || !quantity.trim()) && { opacity: 0.55 },
                  ]}
                >
                  <LinearGradient
                    colors={["#111827", "#1f2937", "#374151"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.submitBtnModern}
                  >
                    <Text style={styles.submitText}>
                      {isNew ? "Add Grocery" : "Update Grocery"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.45)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconCircle: {
    backgroundColor: "#000000", // black theme for groceries
    padding: 10,
    borderRadius: 10,
  },
  submitBtn: {
    backgroundColor: "#000000", // black button
  },
  gradientShell: {
    borderRadius: 28,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.25,
    shadowRadius: 28,
  },
  innerCard: {
    borderRadius: 26,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconCircleModern: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(0,0,0,0.6)",
    overflow: "hidden",
  },
  inputIconWrap: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 14,
    fontSize: 15.5,
    color: "#0f172a",
  },
  submitTouchable: {
    marginTop: 28,
    borderRadius: 22,
    overflow: "hidden",
  },
  submitBtnModern: {
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16.5,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  errorBadge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderColor: "rgba(239,68,68,0.45)",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  errorText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.4,
  },
});

export default GroceryFormScreen;
