// app/(dashboard)/profile/index.tsx
import { useLoader } from "@/context/LoaderContext";
import { auth, db, storage } from "@/firebase";
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
// Note: We don't need expo-media-library just to pick an image.
// Using ImagePicker avoids requesting unnecessary permissions (like AUDIO on Android).
import { useRouter } from "expo-router";
import { deleteUser, signOut, updateProfile } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const [photoURL, setPhotoURL] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        showLoader();
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.photoURL) setPhotoURL(data.photoURL);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        hideLoader();
      }
    };

    fetchProfile();
  }, [user]);

  if (!user) return null;

  const joinDate = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString()
    : "";

  // Pick image
  const handlePickImage = async () => {
    // Request only the media library permission needed for picking images.
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      await uploadImage(asset.uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileRef = ref(storage, `profilePictures/${user.uid}/profile.jpg`);
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);

      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: downloadURL },
        { merge: true }
      );

      await updateProfile(user, { photoURL: downloadURL });
      setPhotoURL(downloadURL);
      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Upload failed:", err);
      Alert.alert("Error", "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!user) return;
    Alert.alert("Delete Account", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            showLoader();
            await deleteDoc(doc(db, "users", user.uid));
            await deleteUser(user);
            router.replace("/(auth)/login");
          } catch (err) {
            console.error("Delete failed:", err);
            Alert.alert("Error", "Failed to delete account.");
          } finally {
            hideLoader();
          }
        },
      },
    ]);
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/girl3.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Dark / color overlay */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.85)",
        }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" />
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 60,
            paddingTop: 30,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              color: "white",
              textAlign: "center",
              letterSpacing: 1,
              marginTop: 8,
              marginBottom: 26,
            }}
          >
            Profile
          </Text>

          {/* Glass Card */}
          <BlurView
            intensity={70}
            tint="dark"
            style={{
              borderRadius: 28,
              paddingTop: 90,
              paddingHorizontal: 20,
              paddingBottom: 28,
              borderWidth: 1,
              minHeight: 480,
              borderColor: "rgba(255,255,255,0.15)",
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 18,
            }}
          >
            {/* Avatar (floating) */}
            <View
              style={{
                position: "absolute",
                top: 10,
                alignSelf: "center",
                alignItems: "center",
              }}
            >
              <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
                <View
                  style={{
                    padding: 4,
                    borderRadius: 100,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.35)",
                  }}
                >
                  {photoURL || user.photoURL ? (
                    <Image
                      source={{ uri: photoURL || user.photoURL! }}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        borderWidth: 3,
                        borderColor: "#0ea5e9",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        backgroundColor: "#1f2937",
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: "#0ea5e9",
                      }}
                    >
                      <Text style={{ color: "#9ca3af", fontWeight: "600" }}>
                        Add Photo
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              {uploading && (
                <Text
                  style={{
                    color: "#0ea5e9",
                    fontSize: 12,
                    marginTop: 6,
                    fontWeight: "600",
                  }}
                >
                  Uploading...
                </Text>
              )}
            </View>

            {/* Identity */}
            <Text
              style={{
                marginTop: 60,
                fontSize: 18,
                fontWeight: "700",
                color: "white",
                textAlign: "center",
              }}
            >
              {user.email}
            </Text>
            {joinDate ? (
              <Text
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.6)",
                  marginTop: 4,
                  fontSize: 13,
                  letterSpacing: 0.5,
                }}
              >
                Member since {joinDate}
              </Text>
            ) : null}

            {/* Quick Actions Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 28,
                gap: 14,
              }}
            >
              <TouchableOpacity
                onPress={handlePickImage}
                style={quickActionStyle}
              >
                <MaterialIcons name="photo-camera" size={26} color="#0ea5e9" />
                <Text style={quickActionText}>Change Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/forgotPassword")}
                style={quickActionStyle}
              >
                <MaterialIcons name="lock-reset" size={26} color="#0ea5e9" />
                <Text style={quickActionText}>Reset Password</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={{ marginTop: 26 }}>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                style={glassButton("#ef4444")}
              >
                <MaterialIcons
                  name="delete-forever"
                  size={22}
                  color="#ef4444"
                />
                <Text style={glassButtonText("#ef4444")}>Delete Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  signOut(auth);
                  router.replace("/");
                }}
                style={glassButton("#0ea5e9")}
              >
                <MaterialIcons name="logout" size={22} color="#0ea5e9" />
                <Text style={glassButtonText("#0ea5e9")}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Footer / Meta */}
          <Text
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.45)",
              marginTop: 26,
              fontSize: 12,
              letterSpacing: 1,
            }}
          >
            MyGroceries · v1.0.0
          </Text>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

// helper styles (placed before export if needed)
const quickActionStyle = {
  flex: 1,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
  paddingVertical: 14,
  paddingHorizontal: 10,
  borderRadius: 18,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  gap: 6,
};

const quickActionText = {
  color: "white",
  fontSize: 12,
  fontWeight: "600" as const,
  textAlign: "center" as const,
  letterSpacing: 0.5,
};

const glassButton = (accent: string) => ({
  flexDirection: "row" as const,
  alignItems: "center" as const,
  gap: 10,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: accent + "55",
  paddingVertical: 14,
  paddingHorizontal: 18,
  borderRadius: 18,
  marginBottom: 14,
});

const glassButtonText = (accent: string) => ({
  color: accent,
  fontWeight: "700" as const,
  fontSize: 15,
  letterSpacing: 0.5,
});

export default ProfileScreen;
