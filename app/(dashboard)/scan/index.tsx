// app/Scan.tsx
import { Camera, CameraView } from "expo-camera";
import Constants from "expo-constants";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Scan() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView | null>(null);
  const [processing, setProcessing] = useState(false);
  const [detectedLabel, setDetectedLabel] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);

  // Prefer EXPO_PUBLIC_ env (auto-injected by Expo). Fallback to app.config extra.
  const ENV_GCV = process.env.EXPO_PUBLIC_GCV_API_KEY;
  const EXTRA_GCV = (Constants?.expoConfig as any)?.extra?.gcvApiKey;
  const GOOGLE_VISION_API_KEY = ENV_GCV || EXTRA_GCV || "";

  // Debug (safe): log the source and last 4 chars to confirm detection
  useEffect(() => {
    const src = ENV_GCV ? "env" : EXTRA_GCV ? "constants-extra" : "none";
    const tail = (ENV_GCV || EXTRA_GCV || "").slice(-4);
    console.log(
      "[Scan] GCV API key source:",
      src,
      "len:",
      (ENV_GCV || EXTRA_GCV || "").length,
      "tail:",
      tail
    );
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const captureAndDetect = async () => {
    if (processing) return;
    try {
      setProcessing(true);
      setDetectedLabel(null);
      setCandidates([]);
      const photo = await cameraRef.current?.takePictureAsync({
        base64: true,
        quality: 0.8, // better quality improves detection accuracy
        skipProcessing: false,
      });
      if (!photo?.base64) {
        Alert.alert("Error", "Failed to capture image.");
        return;
      }
      if (!GOOGLE_VISION_API_KEY) {
        Alert.alert(
          "Setup required",
          "Add your Google Vision API key to proceed."
        );
        return;
      }
      const body = {
        requests: [
          {
            image: { content: photo.base64 },
            imageContext: { languageHints: ["en"] },
            features: [
              { type: "LOGO_DETECTION", maxResults: 5 },
              { type: "WEB_DETECTION", maxResults: 5 },
              { type: "TEXT_DETECTION", maxResults: 5 },
              { type: "OBJECT_LOCALIZATION", maxResults: 5 },
              {
                type: "LABEL_DETECTION",
                maxResults: 5,
                model: "builtin/latest",
              },
            ],
          },
        ],
      } as const;
      const res = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const json = await res.json();
      const response = json?.responses?.[0];
      const all = extractCandidates(response);
      if (all.length > 0) {
        setCandidates(all);
        setDetectedLabel(all[0]);
      } else {
        Alert.alert("Not found", "Could not recognize the item. Try again.");
      }
    } catch (e) {
      console.error("[Scan] Vision error", e);
      Alert.alert("Error", "Failed to analyze image.");
    } finally {
      setProcessing(false);
    }
  };

  function extractCandidates(resp: any): string[] {
    if (!resp) return [];

    type Cand = { text: string; score: number; source: string };
    const out: Cand[] = [];

    // 1) Logos (brands)
    const logos =
      (resp.logoAnnotations as Array<{
        description: string;
        score?: number;
      }>) || [];
    logos.forEach((l) => {
      if (l?.description)
        out.push({
          text: l.description,
          score: l.score ?? 0.85,
          source: "logo",
        });
    });

    // 2) Web best-guess and entities
    const web = resp.webDetection as any;
    const bestGuess = web?.bestGuessLabels?.[0]?.label as string | undefined;
    if (bestGuess)
      out.push({ text: bestGuess, score: 0.8, source: "web-guess" });
    const webEntities =
      (web?.webEntities as Array<{ description?: string; score?: number }>) ||
      [];
    webEntities.forEach((w) => {
      if (w.description && (w.score ?? 0) >= 0.5)
        out.push({
          text: w.description,
          score: w.score ?? 0.6,
          source: "web-entity",
        });
    });

    // 3) OCR lines: prefer TitleCase/ALLCAPS, skip generic words
    const fullText: string | undefined = resp.fullTextAnnotation?.text;
    if (fullText) {
      const stop = new Set([
        "tea",
        "green",
        "black",
        "carton",
        "bottle",
        "box",
        "drink",
        "organic",
        "product",
        "net",
        "weight",
        "ml",
        "g",
      ]);
      const lines = fullText
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && s.length <= 40);
      const brandy = lines.filter((s) => {
        const pure = s.replace(/[^A-Za-z0-9 \-]/g, "").trim();
        if (!pure) return false;
        const tokens = pure.split(/\s+/);
        // Kill lines dominated by stopwords
        const stopCount = tokens.filter((t) =>
          stop.has(t.toLowerCase())
        ).length;
        if (stopCount / tokens.length > 0.4) return false;
        if (tokens.length === 1) {
          const t = tokens[0].toLowerCase();
          if (stop.has(t)) return false;
          return /^(?:[A-Z][a-z]+|[A-Z]{3,})$/.test(pure); // TitleCase or ALLCAPS
        }
        // 2+ words: majority capitalized or TitleCase
        const capRatio =
          tokens.filter((t) => /^[A-Z]/.test(t)).length / tokens.length;
        return capRatio >= 0.6;
      });
      brandy
        .slice(0, 6)
        .forEach((s, i) =>
          out.push({ text: s, score: 0.7 - i * 0.05, source: "ocr" })
        );
    }

    // 4) Objects (low priority, may be generic like "carton")
    const objects =
      (resp.localizedObjectAnnotations as Array<{
        name: string;
        score?: number;
      }>) || [];
    objects.forEach((o) => {
      if (o.name)
        out.push({
          text: o.name,
          score: (o.score ?? 0.5) * 0.6,
          source: "object",
        });
    });

    // 5) Labels fallback
    const labels =
      (resp.labelAnnotations as Array<{
        description: string;
        score?: number;
      }>) || [];
    labels.forEach((l) => {
      if (l.description)
        out.push({
          text: l.description,
          score: (l.score ?? 0.5) * 0.5,
          source: "label",
        });
    });

    // Normalize & rank, prefer higher score and non-generic tokens
    const normalized = new Map<string, Cand>();
    const normalize = (s: string) =>
      s.trim().replace(/\s+/g, " ").toLowerCase();
    out.forEach((c) => {
      const key = normalize(c.text);
      if (!key) return;
      const prev = normalized.get(key);
      if (!prev || c.score > prev.score) normalized.set(key, c);
    });
    return [...normalized.values()]
      .sort((a, b) => b.score - a.score)
      .map((c) => c.text)
      .slice(0, 5);
  }

  function pickBestLabel(resp: any): string | null {
    if (!resp) return null;

    // 1) Prefer Logo detections (brand logos)
    const logos = resp.logoAnnotations as Array<{
      description: string;
      score?: number;
    }>;
    if (Array.isArray(logos) && logos.length) {
      const topLogo = [...logos].sort(
        (a, b) => (b.score || 0) - (a.score || 0)
      )[0];
      if (topLogo?.description && (topLogo.score ?? 0) >= 0.5)
        return topLogo.description;
    }

    // 2) Web entities / best guess labels can capture product/brand names
    const web = resp.webDetection as any;
    const bestGuess = web?.bestGuessLabels?.[0]?.label;
    if (bestGuess) return bestGuess;
    const webEntities =
      (web?.webEntities as Array<{ description?: string; score?: number }>) ||
      [];
    const strongEntity = webEntities
      .filter((w) => (w.score || 0) >= 0.6 && w.description)
      .sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    if (strongEntity?.description) return strongEntity.description;

    // 3) Text detection (read label). Use first significant line.
    const fullText = resp.fullTextAnnotation?.text as string | undefined;
    if (fullText) {
      const firstLine = fullText
        .split(/\r?\n/)
        .map((s: string) => s.trim())
        .find((s: string) => s.length > 1);
      if (firstLine) return firstLine;
    }

    // 4) Object localization: return top object name (e.g., "wine bottle")
    const objects =
      (resp.localizedObjectAnnotations as Array<{
        name: string;
        score?: number;
      }>) || [];
    const topObj = objects.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    if (topObj?.name && (topObj.score ?? 0) >= 0.6) return topObj.name;

    // 5) Fallback to label detection with higher threshold
    const labels =
      (resp.labelAnnotations as Array<{
        description: string;
        score?: number;
      }>) || [];
    const topLabel = labels.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    if (topLabel?.description && (topLabel.score ?? 0) >= 0.7)
      return topLabel.description;

    return null;
  }

  const openWeb = () => {
    if (!detectedLabel) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(detectedLabel)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Cannot open browser.")
    );
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} />
      <View style={styles.bottomBar}>
        {processing ? (
          <>
            <ActivityIndicator color="#fff" />
            <Text style={styles.text}>Analyzing...</Text>
          </>
        ) : detectedLabel ? (
          <>
            <Text style={styles.text}>Detected: {detectedLabel}</Text>
            {candidates.length > 1 ? (
              <View
                style={{
                  marginTop: 8,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                {candidates.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setDetectedLabel(c)}
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 16,
                      backgroundColor:
                        c === detectedLabel ? "#10b981" : "#1f2937",
                      borderWidth: 1,
                      borderColor: "#374151",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 13 }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            <View style={{ height: 8 }} />
            <Button title="Search Web" onPress={openWeb} />
            <View style={{ height: 8 }} />
            <Button title="Scan Again" onPress={() => setDetectedLabel(null)} />
          </>
        ) : (
          <>
            <Text style={styles.text}>Point the camera at the item</Text>
            <View style={{ height: 8 }} />
            <TouchableOpacity
              onPress={captureAndDetect}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                backgroundColor: "#2563eb",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Scan</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
