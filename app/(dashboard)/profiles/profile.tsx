// app/(dashboard)/profile/index.tsx
import { useLoader } from "@/context/LoaderContext";
import { auth, db, storage } from "@/firebase";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { deleteUser, signOut, updateProfile } from "firebase/auth";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
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

  // Upload profile picture
  const handlePickImage = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
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
            router.replace("/auth/login");
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
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ alignItems: "center", padding: 20 }}>
        {/* Profile Picture */}
        <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
          {photoURL || user.photoURL ? (
            <Image
              source={{ uri: photoURL || user.photoURL! }}
              style={{
                width: 128,
                height: 128,
                borderRadius: 64,
                marginBottom: 16,
              }}
            />
          ) : (
            <View
              style={{
                width: 128,
                height: 128,
                borderRadius: 64,
                backgroundColor: "#d1d5db",
                marginBottom: 16,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#4b5563" }}>Add Photo</Text>
            </View>
          )}
          {uploading && <ActivityIndicator style={{ marginTop: 8 }} />}
        </TouchableOpacity>

        {/* Email (readonly) */}
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
          {user.email}
        </Text>

        {/* Reset Password Button */}
        <TouchableOpacity
          onPress={() => router.push("(auth)/forgotPassword")}
          style={{
            backgroundColor: "#3b82f6",
            width: "100%",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
          >
            Reset Password
          </Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={{
            backgroundColor: "#ef4444",
            width: "100%",
            padding: 12,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <Text
            style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}
          >
            Delete Account
          </Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={() => {
            signOut(auth);
            router.replace("/");
          }}
          style={{ marginTop: 8 }}
        >
          <Text style={{ color: "#3b82f6", textDecorationLine: "underline" }}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
