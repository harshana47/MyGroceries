import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

interface Place {
  vicinity: string | undefined;
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const fallbackMarkers: Place[] = [
  {
    id: "demo1",
    name: "Demo Grocery 1",
    latitude: 37.7749,
    longitude: -122.4194,
    vicinity: "Demo Location 1",
  },
  {
    id: "demo2",
    name: "Demo Grocery 2",
    latitude: 37.7849,
    longitude: -122.4094,
    vicinity: "Demo Location 2",
  },
];

const MapScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tileError, setTileError] = useState(false);

  // Show fallback markers if there are no places and not loading
  const showFallback = !loadingPlaces && (!places || places.length === 0);

  // Get API key from Expo config (works in Expo Go)
  const GOOGLE_MAPS_API_KEY =
    Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY ||
    "YOUR_FALLBACK_KEY_HERE";

  const fetchPlaces = useCallback(async (lat: number, lng: number) => {
    setLoadingPlaces(true);
    setErrorMsg(null);
    setApiStatus(null);
    setDebugInfo(null);
    try {
      const res = await fetch(
        `https://us-central1-my-grocery-9fbf7.cloudfunctions.net/getNearbyGroceries?lat=${lat}&lng=${lng}&radius=500000&keyword=grocery&type=supermarket&debug=1`
      );
      const data = await res.json();
      if (data.places && data.places.length) {
        setPlaces(data.places);
      } else {
        setPlaces([]);
        setApiStatus(data.status || "NO_RESULTS");
      }
      if (data.debug) setDebugInfo(data.debug);
    } catch (e) {
      setErrorMsg("Failed to fetch nearby places");
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        fetchPlaces(loc.coords.latitude, loc.coords.longitude);
      } catch {
        setErrorMsg("Unable to get current location");
      }
    })();
  }, [fetchPlaces]);

  // If location retrieval failed earlier we already return a loader.

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <MapView
        style={styles.map}
        onMapReady={() => setMapReady(true)}
        onRegionChangeComplete={() => setTileError(false)}
        onMapLoaded={() => setTileError(false)}
        initialRegion={{
          latitude: location?.coords?.latitude ?? 0,
          longitude: location?.coords?.longitude ?? 0,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        }}
        showsUserLocation
        showsCompass
      >
        {/* User marker */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            pinColor="blue"
          />
        )}
        {/* API markers */}
        {places.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.latitude,
              longitude: store.longitude,
            }}
            title={store.name}
            description={store.vicinity}
            pinColor="green"
          />
        ))}
        {/* Fallback markers */}
        {fallbackMarkers.map((m) => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            title={m.name}
            description="(Fallback demo)"
            pinColor="orange"
          />
        ))}
      </MapView>

      {!mapReady && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={{ color: "#fff", marginTop: 12, fontWeight: "bold" }}>
            Loading map...
          </Text>
        </View>
      )}

      {/* Status / Debug Panel */}
      <View
        style={{
          position: "absolute",
          top: 50,
          left: 16,
          right: 16,
          backgroundColor: "rgba(0,0,0,0.55)",
          padding: 14,
          borderRadius: 16,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>
          Nearby Groceries
        </Text>
        {loadingPlaces && (
          <Text style={{ color: "#ddd", marginTop: 4 }}>Loading...</Text>
        )}
        {!loadingPlaces && showFallback && (
          <Text style={{ color: "#fca5a5", marginTop: 4 }}>
            {errorMsg
              ? errorMsg
              : apiStatus === "ZERO_RESULTS" || apiStatus === "NO_RESULTS"
                ? "No grocery places found (showing demo markers)."
                : apiStatus
                  ? `Status: ${apiStatus}`
                  : "No data returned."}
          </Text>
        )}
        {!loadingPlaces && debugInfo && (
          <Text
            style={{
              color: "#93c5fd",
              marginTop: 6,
              fontSize: 11,
            }}
            numberOfLines={2}
          >
            debug: {debugInfo.url}
          </Text>
        )}
      </View>

      {/* Refresh */}
      <TouchableOpacity
        onPress={async () => {
          if (!location) return;
          fetchPlaces(location.coords.latitude, location.coords.longitude);
        }}
        style={{
          position: "absolute",
          bottom: 40,
          right: 20,
          backgroundColor: "rgba(0,0,0,0.7)",
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 30,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {loadingPlaces ? "..." : "Refresh"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
