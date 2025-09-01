import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const MapScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  // Get API key from Expo config (works in Expo Go)
  const GOOGLE_MAPS_API_KEY =
    Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY ||
    "YOUR_FALLBACK_KEY_HERE";

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Fetch nearby grocery stores via Firebase function
      setLoadingPlaces(true);
      try {
        const res = await fetch(
          `https://us-central1-my-grocery-9fbf7.cloudfunctions.net/getNearbyGroceries?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}&radius=2000&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();

        if (data.places) {
          setPlaces(data.places);
        } else {
          setErrorMsg("No places found nearby");
        }
      } catch (err) {
        console.error("Error fetching nearby places:", err);
        setErrorMsg("Failed to fetch nearby places");
      } finally {
        setLoadingPlaces(false);
      }
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        {errorMsg && <Text>{errorMsg}</Text>}
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation
    >
      {/* User location marker */}
      <Marker
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
        title="You are here"
        pinColor="blue"
      />

      {/* Nearby grocery markers */}
      {places.map((store) => (
        <Marker
          key={store.id}
          coordinate={{ latitude: store.latitude, longitude: store.longitude }}
          title={store.name}
          pinColor="green"
        />
      ))}
    </MapView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
