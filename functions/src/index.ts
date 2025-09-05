import * as functions from "firebase-functions";
import fetch from "node-fetch";

// Support both firebase functions:config and env var
const API_KEY =
  (functions.config().maps && functions.config().maps.key) ||
  process.env.GOOGLE_MAPS_API_KEY;

export const getNearbyGroceries = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  const lat = req.query.lat as string;
  const lng = req.query.lng as string;
  const radiusParam = (req.query.radius as string) || "3000";
  const keyword = (req.query.keyword as string) || "grocery";
  const type = (req.query.type as string) || "supermarket";
  const debug = req.query.debug === "1";

  if (!API_KEY) {
    res.status(500).json({ error: "Missing Google Maps API key on server." });
    return;
  }
  if (!lat || !lng) {
    res.status(400).json({ error: "lat and lng required" });
    return;
  }

  let url: string;
  if (radiusParam === "distance") {
    // rankby=distance cannot be used with radius; location + keyword/type required
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=${type}&keyword=${encodeURIComponent(
      keyword
    )}&key=${API_KEY}`;
  } else {
    const parsed = parseInt(radiusParam, 10);
    const safeRadius = isNaN(parsed) ? 3000 : Math.min(parsed, 50000); // Google max 50,000
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${safeRadius}&type=${type}&keyword=${encodeURIComponent(
      keyword
    )}&key=${API_KEY}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (debug) {
      console.log("DEBUG nearby request status:", data.status, "url:", url);
    }

    if (data.status !== "OK") {
      res.status(200).json({
        places: [],
        status: data.status,
        error_message: data.error_message || null,
        debug: debug ? { url, raw: data } : undefined,
      });
      return;
    }

    const places = (data.results || []).map((p: any) => ({
      id: p.place_id,
      name: p.name,
      latitude: p.geometry?.location?.lat,
      longitude: p.geometry?.location?.lng,
      vicinity: p.vicinity,
    }));

    res.json({
      places,
      status: data.status,
      count: places.length,
      debug: debug ? { url } : undefined,
    });
  } catch (err) {
    console.error("Places API failure:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});
