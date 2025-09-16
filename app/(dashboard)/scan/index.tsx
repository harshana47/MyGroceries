// app/Scan.tsx
import { groceriesRef } from "@/services/groceryService";
import { Camera, CameraView } from "expo-camera";
import Constants from "expo-constants";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { getDocs } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Linking,
  StyleSheet,
  Switch,
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
  const [grocerySet, setGrocerySet] = useState<Set<string>>(new Set());
  const [multiMode, setMultiMode] = useState(false);
  const [multiItems, setMultiItems] = useState<string[]>([]);

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

  // Load user's grocery list names for highlighting
  useEffect(() => {
    const loadGroceries = async () => {
      try {
        const snap = await getDocs(groceriesRef());
        const set = new Set<string>();
        snap.forEach((d) => {
          const data = d.data() as any;
          if (data?.name) set.add(normalizeLabel(data.name));
        });
        setGrocerySet(set);
      } catch (e) {
        console.log("[Scan] Could not load groceries for highlight", e);
      }
    };
    loadGroceries();
  }, []);

  const captureAndDetect = async () => {
    if (processing) return;
    try {
      setProcessing(true);
      setDetectedLabel(null);
      setCandidates([]);
      setMultiItems([]);
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
      // If multi-item mode: run object localization first
      if (multiMode) {
        const locateBody = {
          requests: [
            {
              image: { content: photo.base64 },
              features: [{ type: "OBJECT_LOCALIZATION", maxResults: 15 }],
            },
          ],
        } as const;
        const locateRes = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(locateBody),
          }
        );
        const locateJson = await locateRes.json();
        const locResp = locateJson?.responses?.[0];
        const objects: Array<{
          name: string;
          score?: number;
          boundingPoly?: any;
        }> = (locResp?.localizedObjectAnnotations as any[]) || [];

        // Sort by score and limit
        const sorted = objects
          .filter((o) => Array.isArray(o?.boundingPoly?.normalizedVertices))
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 6);

        const crops: { base64: string; hint?: string }[] = [];
        for (const obj of sorted) {
          const base64 = await cropFromNormalizedBox(
            photo,
            obj.boundingPoly.normalizedVertices
          );
          if (base64)
            crops.push({
              base64,
              hint: obj?.name ? String(obj.name) : undefined,
            });
        }

        const detailedFeatures = [
          { type: "LOGO_DETECTION", maxResults: 8 },
          { type: "WEB_DETECTION", maxResults: 20 },
          { type: "TEXT_DETECTION", maxResults: 8 },
          { type: "LABEL_DETECTION", maxResults: 20, model: "builtin/latest" },
        ];

        const items: string[] = [];
        for (const c of crops) {
          const body = {
            requests: [
              { image: { content: c.base64 }, features: detailedFeatures },
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
          const j = await res.json();
          const r = j?.responses?.[0];
          const cand = pickSpecificItem(r, c.hint) || extractCandidates(r)[0];
          if (cand) items.push(cand);
        }

        // Dedupe and set
        const seen = new Set<string>();
        const unique = items.filter((x) => {
          const k = normalizeLabel(x);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        if (unique.length) {
          setMultiItems(unique);
          // Also set a headline detectedLabel to the first
          setDetectedLabel(unique[0]);
        } else {
          Alert.alert(
            "Not found",
            "Could not recognize separate items. Try a closer photo."
          );
        }
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

  async function cropFromNormalizedBox(
    photo: { uri?: string; width?: number; height?: number },
    normVerts: Array<{ x?: number; y?: number }>
  ): Promise<string | null> {
    try {
      if (!photo?.uri) return null;
      // Compute bounding box in pixels
      // Normalize missing width/height by assuming 1000x1000 if absent
      const W = photo.width || 1000;
      const H = photo.height || 1000;
      const xs = normVerts.map((v) => Math.max(0, Math.min(1, v.x ?? 0)));
      const ys = normVerts.map((v) => Math.max(0, Math.min(1, v.y ?? 0)));
      const xMin = Math.min(...xs);
      const xMax = Math.max(...xs);
      const yMin = Math.min(...ys);
      const yMax = Math.max(...ys);
      let originX = Math.round(xMin * W);
      let originY = Math.round(yMin * H);
      let width = Math.round((xMax - xMin) * W);
      let height = Math.round((yMax - yMin) * H);
      // Add small padding
      const pad = 6;
      originX = Math.max(0, originX - pad);
      originY = Math.max(0, originY - pad);
      width = Math.min(W - originX, width + pad * 2);
      height = Math.min(H - originY, height + pad * 2);
      // Skip tiny boxes
      if (width < 40 || height < 40) return null;
      // Prepare actions: crop then optional resize to ensure sufficient pixels
      const actions: any[] = [{ crop: { originX, originY, width, height } }];
      const minDim = 512;
      if (Math.min(width, height) < minDim) {
        const scale = minDim / Math.min(width, height);
        const targetW = Math.round(width * scale);
        const targetH = Math.round(height * scale);
        actions.push({ resize: { width: targetW, height: targetH } });
      }
      const result = await manipulateAsync(photo.uri, actions, {
        compress: 0.9,
        format: SaveFormat.JPEG,
        base64: true,
      });
      return result.base64 || null;
    } catch (e) {
      console.log("[Scan] Crop failed", e);
      return null;
    }
  }

  function pickSpecificItem(resp: any, hint?: string): string | null {
    if (!resp) return null;
    const FRUITS = new Set([
      "banana",
      "apple",
      "grape",
      "grapes",
      "orange",
      "mango",
      "pineapple",
      "strawberry",
      "blueberry",
      "raspberry",
      "blackberry",
      "pear",
      "peach",
      "plum",
      "cherry",
      "watermelon",
      "cantaloupe",
      "melon",
      "papaya",
      "kiwi",
      "lemon",
      "lime",
      "pomegranate",
      "apricot",
      "nectarine",
      "dragon fruit",
      "passion fruit",
      "grapefruit",
    ]);
    const VEGETABLES = new Set([
      "tomato",
      "potato",
      "onion",
      "garlic",
      "carrot",
      "cucumber",
      "bell pepper",
      "capsicum",
      "pepper",
      "eggplant",
      "aubergine",
      "zucchini",
      "courgette",
      "broccoli",
      "cauliflower",
      "cabbage",
      "lettuce",
      "spinach",
      "kale",
      "okra",
      "beans",
      "green beans",
      "peas",
      "beetroot",
      "radish",
      "ginger",
      "chili",
      "chilli",
    ]);
    const GENERIC = new Set([
      "fruit",
      "fruits",
      "vegetable",
      "vegetables",
      "produce",
      "food",
      "groceries",
    ]);

    const allDict = new Set<string>([...FRUITS, ...VEGETABLES]);
    const canonical = (d: string) => {
      let s = d.toLowerCase();
      if (s.endsWith("es") && allDict.has(s.slice(0, -2))) s = s.slice(0, -2);
      else if (s.endsWith("s") && allDict.has(s.slice(0, -1)))
        s = s.slice(0, -1);
      if (s === "capsicum") s = "bell pepper";
      if (s === "aubergine") s = "eggplant";
      if (s === "courgette") s = "zucchini";
      if (s === "chilli") s = "chili";
      return s;
    };

    const acceptSpecific = (d: string) => {
      const c = canonical(d);
      if (GENERIC.has(c)) return null;
      if (FRUITS.has(c) || VEGETABLES.has(c)) return toTitle(c);
      for (const w of allDict) {
        if (c.includes(w)) return toTitle(w);
      }
      return null;
    };

    // 0) Use object name hint if Vision localized an object like "banana"
    if (hint) {
      const a = acceptSpecific(hint);
      if (a) return a;
    }

    // Prefer web entities matching fruit names
    const web = resp.webDetection as any;
    const webEntities = ((web?.webEntities as any[]) || [])
      .filter((w) => w?.description)
      .map((w) => ({
        desc: String(w.description).toLowerCase(),
        score: Number(w.score || 0),
      }));
    const fruitEntity = webEntities
      .filter((w) => {
        const d = w.desc;
        if (GENERIC.has(d)) return false;
        // direct fruit match or contains fruit token
        return [...FRUITS].some(
          (f) => d === f || d.includes(` ${f}`) || d.startsWith(`${f} `)
        );
      })
      .sort((a, b) => b.score - a.score)[0];
    if (fruitEntity) {
      const a = acceptSpecific(fruitEntity.desc);
      if (a) return a;
    }

    // Labels fallback for fruit words
    const labels = ((resp.labelAnnotations as any[]) || []).map((l) => ({
      desc: String(l.description || "").toLowerCase(),
      score: Number(l.score || 0),
    }));
    const fruitLabel = labels
      .filter(
        (l) =>
          !GENERIC.has(l.desc) &&
          [...allDict].some((f) => l.desc === f || l.desc.includes(f))
      )
      .sort((a, b) => b.score - a.score)[0];
    if (fruitLabel) {
      const a = acceptSpecific(fruitLabel.desc);
      if (a) return a;
    }

    // OCR lines: look for fruit words
    const fullText: string | undefined = resp.fullTextAnnotation?.text;
    if (fullText) {
      const match = fullText
        .toLowerCase()
        .split(/\r?\n/)
        .map((s) => s.trim())
        .find(
          (line) =>
            [...allDict].some((f) => line.includes(f)) &&
            ![...GENERIC].some((g) => line === g)
        );
      if (match) {
        const f = [...allDict].find((w) => match.includes(w));
        if (f) return toTitle(f);
      }
    }
    return null;
  }

  function toTitle(s: string): string {
    return s
      .split(" ")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

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

  function normalizeLabel(s: string): string {
    return s
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s\-]/g, "")
      .replace(/\s+/g, " ");
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
            {!multiMode && candidates.length > 1 ? (
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
                      backgroundColor: grocerySet.has(normalizeLabel(c))
                        ? "#10b981"
                        : "#1f2937",
                      borderWidth: c === detectedLabel ? 2 : 1,
                      borderColor: c === detectedLabel ? "#93c5fd" : "#374151",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 13 }}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {multiMode && multiItems.length > 0 ? (
              <View style={{ marginTop: 8, width: "100%" }}>
                {multiItems.map((item, idx) => (
                  <View
                    key={`${item}-${idx}`}
                    style={{
                      marginVertical: 4,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: grocerySet.has(normalizeLabel(item))
                        ? "#10b981"
                        : "#1f2937",
                      borderWidth: 1,
                      borderColor: "#374151",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 14 }}>{item}</Text>
                  </View>
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text style={styles.text}>Point the camera</Text>
              <View style={{ width: 20 }} />
              <Text style={{ color: "#fff", fontSize: 14 }}>Multi-item</Text>
              <Switch
                value={multiMode}
                onValueChange={setMultiMode}
                style={{ marginLeft: 8 }}
              />
            </View>
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
