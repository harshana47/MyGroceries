import * as functions from "firebase-functions";
import fetch from "node-fetch";

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY!;

export const getNearbyGroceries = functions.https.onRequest(async (req, res) => {
  const lat = req.query.lat as string;
  const lng = req.query.lng as string;

  if (!lat || !lng) {
    res.status(400).json({ error: "lat and lng required" });
    return;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=2000&type=supermarket&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    const places = data.results.map((p: any) => ({
      id: p.place_id,
      name: p.name,
      latitude: p.geometry.location.lat,
      longitude: p.geometry.location.lng,
    }));

    res.json({ places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});
