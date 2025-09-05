import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region, UrlTile } from "react-native-maps";

// fallback region (Colombo)
const FALLBACK_REGION: Region = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  vicinity?: string;
};

const fallbackMarkers: Place[] = [
  { id: "1", name: "Demo Store A", latitude: 6.928, longitude: 79.86 },
  { id: "2", name: "Demo Store B", latitude: 6.93, longitude: 79.865 },
];

const MapScreen = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{ url: string } | null>(null);
  const [apiStatus, setApiStatus] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Request user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setPermissionError("Location permission denied. Using fallback.");
          setRegion(FALLBACK_REGION);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        });
        fetchPlacesByRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        });
      } catch (e) {
        setErrorMsg("Unable to get current location");
        setRegion(FALLBACK_REGION);
      }
    })();
  }, []);

  // Fetch places using map region bounding box
  const fetchPlacesByRegion = async (r: Region) => {
    try {
      setLoadingPlaces(true);
      setShowFallback(false);
      setApiStatus(null);

      const south = r.latitude - r.latitudeDelta / 2;
      const north = r.latitude + r.latitudeDelta / 2;
      const west = r.longitude - r.longitudeDelta / 2;
      const east = r.longitude + r.longitudeDelta / 2;

      const url = `https://overpass-api.de/api/interpreter?data=[out:json];node["shop"~"supermarket|convenience"](${south},${west},${north},${east});out;`;
      setDebugInfo({ url });

      const res = await fetch(url);
      const data = await res.json();

      if (data.elements && data.elements.length > 0) {
        const mapped = data.elements.map((p: any) => ({
          id: p.id.toString(),
          name:
            p.tags?.name ||
            (p.tags?.shop === "convenience"
              ? "Convenience Store"
              : "Supermarket"),
          latitude: p.lat,
          longitude: p.lon,
          vicinity:
            p.tags?.addr_full ||
            p.tags?.addr_street ||
            p.tags?.addr_city ||
            "Unknown address",
        }));
        setPlaces(mapped);
        setShowFallback(false);
        setApiStatus("OK");
      } else {
        setPlaces([]);
        setShowFallback(true);
        setApiStatus("NO_RESULTS");
      }
    } catch (e) {
      console.error("OSM fetch error:", e);
      setErrorMsg("Failed to fetch places");
      setShowFallback(true);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Tiles timeout
  useEffect(() => {
    if (!mapReady || tilesLoaded) return;
    timeoutRef.current = setTimeout(() => {
      if (!tilesLoaded) {
        console.warn("Tiles did not load in time");
      }
    }, 8000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [mapReady, tilesLoaded]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      {!region && (
        <View style={styles.loaderLayer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loaderText}>Getting location...</Text>
        </View>
      )}

      {region && (
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          onRegionChangeComplete={(r) => {
            setRegion(r);
            fetchPlacesByRegion(r);
          }}
          showsUserLocation
          showsMyLocationButton
          onMapReady={() => setMapReady(true)}
          onMapLoaded={() => setTilesLoaded(true)}
          loadingEnabled
          loadingIndicatorColor="#6366f1"
        >
          {/* OpenStreetMap tiles */}
          <UrlTile
            urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />

          {/* User location marker */}
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
          {showFallback &&
            fallbackMarkers.map((m) => (
              <Marker
                key={m.id}
                coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                title={m.name}
                description="(Fallback demo)"
                pinColor="orange"
              />
            ))}
        </MapView>
      )}

      {!mapReady && (
        <View style={styles.loaderLayer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loaderText}>Loading map...</Text>
        </View>
      )}

      {/* Debug Panel */}
      <View style={styles.debugBox}>
        <Text style={styles.debugTitle}>Nearby Groceries</Text>
        {loadingPlaces && <Text style={styles.debugLine}>Loading...</Text>}
        {!loadingPlaces && showFallback && (
          <Text style={styles.debugLine}>
            {errorMsg
              ? errorMsg
              : apiStatus === "NO_RESULTS"
                ? "No grocery places found (showing demo markers)."
                : apiStatus
                  ? `Status: ${apiStatus}`
                  : "No data returned."}
          </Text>
        )}
        {debugInfo && (
          <Text style={[styles.debugLine, { color: "#93c5fd" }]}>
            debug: {debugInfo.url}
          </Text>
        )}
      </View>

      {/* Refresh */}
      <TouchableOpacity
        onPress={() => region && fetchPlacesByRegion(region)}
        style={styles.refreshButton}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {loadingPlaces ? "..." : "Refresh"}
        </Text>
      </TouchableOpacity>

      {/* Permission / Error */}
      {permissionError && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{permissionError}</Text>
        </View>
      )}
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  loaderLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loaderText: {
    marginTop: 12,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  banner: {
    position: "absolute",
    top: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  debugBox: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: "rgba(17,24,39,0.9)",
    padding: 14,
    borderRadius: 16,
  },
  debugTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  debugLine: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginBottom: 2,
    lineHeight: 16,
  },
  refreshButton: {
    position: "absolute",
    bottom: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
  },
});
