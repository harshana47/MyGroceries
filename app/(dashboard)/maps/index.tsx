import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Place = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  vicinity?: string;
  distanceKm?: number;
};

const FALLBACK_REGION: Region = {
  latitude: 6.9271,
  longitude: 79.8612,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const fallbackMarkers: Place[] = [
  { id: "1", name: "Demo Store A", latitude: 6.928, longitude: 79.86 },
  { id: "2", name: "Demo Store B", latitude: 6.93, longitude: 79.865 },
];

const MapScreen = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [locationObj, setLocationObj] =
    useState<Location.LocationObject | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [webviewFail, setWebviewFail] = useState(false);
  const [wvReloadToken, setWvReloadToken] = useState(0);

  // Get location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setPermissionError("Location permission denied. Using fallback.");
          setRegion(FALLBACK_REGION);
          setShowFallback(true);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const r: Region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        };
        setLocationObj(loc);
        setRegion(r);
      } catch {
        setRegion(FALLBACK_REGION);
        setShowFallback(true);
        setErrorMsg("Unable to get location.");
      }
    })();
  }, []);

  // places
  useEffect(() => {
    if (!region) return;
    fetchPlaces(region.latitude, region.longitude);
  }, [region?.latitude, region?.longitude]);

  const fetchPlaces = async (lat: number, lng: number) => {
    try {
      setLoadingPlaces(true);
      setShowFallback(false);
      setApiStatus(null);

      const RADIUS_STEPS = [2000, 4000, 6000, 8000, 10000];
      const MIN_RESULTS = 5;

      const collected: Place[] = [];
      for (let i = 0; i < RADIUS_STEPS.length; i++) {
        const radius = RADIUS_STEPS[i];
        const url = `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];
          (
            nwr["shop"~"^(supermarket|convenience|grocery|mini_market|department_store|hypermarket|greengrocer|mall|butcher|bakery|seafood)$"](around:${radius},${lat},${lng});
            nwr["amenity"="marketplace"](around:${radius},${lat},${lng});
          );
          out geom;`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.elements && data.elements.length > 0) {
          const batch: Place[] = data.elements
            .map((p: any) => {
              const latitude = p.lat ?? p.center?.lat;
              const longitude = p.lon ?? p.center?.lon;
              if (latitude == null || longitude == null) return null;
              const shopType = p.tags?.shop;
              const defaultNameMap: Record<string, string> = {
                convenience: "Convenience Store",
                supermarket: "Supermarket",
                grocery: "Grocery Store",
                mini_market: "Mini Market",
                department_store: "Department Store",
                hypermarket: "Hypermarket",
                greengrocer: "Greengrocer",
                mall: "Shopping Mall",
                butcher: "Butcher",
                bakery: "Bakery",
                seafood: "Seafood Market",
              };
              return {
                id: p.id.toString(),
                name:
                  p.tags?.name ||
                  defaultNameMap[shopType] ||
                  (p.tags?.amenity === "marketplace" ? "Marketplace" : "Store"),
                latitude,
                longitude,
                vicinity:
                  p.tags?.addr_full ||
                  p.tags?.addr_street ||
                  p.tags?.addr_city ||
                  "Unknown address",
              } as Place;
            })
            .filter(Boolean) as Place[];

          // Merge & de-duplicate (by id)
          const map = new Map<string, Place>();
          [...collected, ...batch].forEach((pl) => {
            map.set(pl.id, pl);
          });
          const merged = Array.from(map.values());

          // Compute distance for each (once we have merged set)
          merged.forEach((pl) => {
            pl.distanceKm = haversine(lat, lng, pl.latitude, pl.longitude);
          });

          // Sort by nearest
          merged.sort((a, b) => a.distanceKm! - b.distanceKm!);

          collected.splice(0, collected.length, ...merged);

          if (collected.length >= MIN_RESULTS) {
            setPlaces(collected);
            setApiStatus("OK");
            setShowFallback(false);
            return;
          }
        }
        // If last radius and still insufficient
        if (i === RADIUS_STEPS.length - 1) {
          if (collected.length > 0) {
            setPlaces(collected);
            setApiStatus("PARTIAL");
            setShowFallback(false);
          } else {
            setPlaces([]);
            setApiStatus("NO_RESULTS");
            setShowFallback(true);
          }
        }
      }
    } catch {
      setErrorMsg("Failed to fetch places.");
      setShowFallback(true);
    } finally {
      setLoadingPlaces(false);
    }
  };

  // Build Leaflet HTML for native (WebView)
  const leafletHTML = (r: Region, ps: Place[]) => {
    const encodedPlaces = JSON.stringify(ps);
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
html,body,#map {height:100%;margin:0;padding:0;background:#000;}
.leaflet-container {background:#000;}
.leaflet-popup-content-wrapper {border-radius:12px;}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map = L.map('map',{zoomControl:true}).setView([${r.latitude},${r.longitude}], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
L.circleMarker([${r.latitude},${r.longitude}],{
  radius:8,color:'#2563eb',weight:2,fillColor:'#3b82f6',fillOpacity:0.9
}).addTo(map).bindPopup('You (Current Location)');
var places = ${encodedPlaces};
places.forEach(function(p){
  if(!p.latitude || !p.longitude) return;
  var dist = p.distanceKm != null ? ' ('+p.distanceKm.toFixed(2)+' km)' : '';
  L.marker([p.latitude,p.longitude]).addTo(map).bindPopup(p.name + dist);
});
</script>
</body>
</html>`;
  };

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Web rendering (unchanged)
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        {!region && (
          <View style={styles.loaderLayer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loaderText}>Getting location...</Text>
          </View>
        )}
        {region && (
          <>
            <iframe
              title="osm-map"
              style={{ border: "0", width: "100%", height: "100%" }}
              src={buildOsmEmbed(region)}
            />
            <View style={styles.debugBox}>
              <Text style={styles.debugTitle}>Nearby Groceries (OSM)</Text>
              {loadingPlaces && (
                <Text style={styles.debugLine}>Loading...</Text>
              )}
              {!loadingPlaces && showFallback && (
                <Text style={styles.debugLine}>
                  {errorMsg
                    ? errorMsg
                    : apiStatus === "NO_RESULTS"
                      ? "No grocery places found."
                      : apiStatus
                        ? `Status: ${apiStatus}`
                        : "No data."}
                </Text>
              )}
              {permissionError && (
                <Text style={[styles.debugLine, { color: "#fca5a5" }]}>
                  {permissionError}
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    );
  }

  // Native rendering with WebView + Leaflet
  return (
    <View style={styles.container}>
      {!region && (
        <View style={styles.loaderLayer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loaderText}>Getting location...</Text>
        </View>
      )}
      {region && !webviewFail && (
        <WebView
          key={wvReloadToken}
          originWhitelist={["*"]}
          style={{ flex: 1, backgroundColor: "#000" }}
          source={{
            html: leafletHTML(region, showFallback ? fallbackMarkers : places),
          }}
          javaScriptEnabled
          allowsInlineMediaPlayback
          onError={() => setWebviewFail(true)}
          injectedJavaScriptBeforeContentLoaded={`
            // Suppress FontFaceObserver timeouts & global script errors
            try {
              window.FontFaceObserver = function(){return { load: ()=>Promise.resolve() }};
            } catch(e){}
            window.onerror = function(){ return true; };
            true;
          `}
        />
      )}

      {webviewFail && (
        <View style={styles.loaderLayer}>
          <Text style={styles.loaderText}>Map failed to load.</Text>
          <TouchableOpacity
            onPress={() => {
              setWebviewFail(false);
              setWvReloadToken((t) => t + 1);
            }}
            style={{
              marginTop: 18,
              backgroundColor: "rgba(255,255,255,0.12)",
              paddingHorizontal: 18,
              paddingVertical: 10,
              borderRadius: 18,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Status / Debug Panel */}
      {region && (
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Nearby Groceries</Text>
          {loadingPlaces && <Text style={styles.debugLine}>Loading...</Text>}
          {!loadingPlaces && showFallback && (
            <Text style={styles.debugLine}>
              {errorMsg
                ? errorMsg
                : apiStatus === "NO_RESULTS"
                  ? "No grocery places found (demo markers)."
                  : apiStatus
                    ? `Status: ${apiStatus}`
                    : "No data."}
            </Text>
          )}
          {permissionError && (
            <Text style={[styles.debugLine, { color: "#fca5a5" }]}>
              {permissionError}
            </Text>
          )}
          {webviewFail && (
            <Text style={[styles.debugLine, { color: "#fca5a5" }]}>
              WebView error (suppressed)
            </Text>
          )}
        </View>
      )}

      {/* Refresh */}
      {region && !webviewFail && (
        <TouchableOpacity
          onPress={() =>
            region && fetchPlaces(region.latitude, region.longitude)
          }
          disabled={loadingPlaces}
          style={styles.refreshButton}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {loadingPlaces ? "..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

function buildOsmEmbed(r: Region) {
  const latSpan = r.latitudeDelta || 0.05;
  const lonSpan = r.longitudeDelta || 0.05;
  const south = r.latitude - latSpan / 2;
  const north = r.latitude + latSpan / 2;
  const west = r.longitude - lonSpan / 2;
  const east = r.longitude + lonSpan / 2;
  const marker = `${r.latitude},${r.longitude}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${marker}`;
}

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loaderLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loaderText: {
    marginTop: 10,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  debugBox: {
    position: "absolute",
    top: 50,
    left: 56, // was 16
    right: 56, // was 16
    backgroundColor: "rgba(17,24,39,0.9)",
    padding: 14,
    borderRadius: 16,
    alignItems: "center", // center children
  },
  debugTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 14,
    letterSpacing: 0.5,
    textAlign: "center", // center text
  },
  debugLine: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginBottom: 2,
    lineHeight: 16,
    textAlign: "center", // center text
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
