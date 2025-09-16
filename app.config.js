export default {
  name: "My Groceries",
  slug: "my-groceries",
  icon: "./assets/images/grocery.png",
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/grocery.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    favicon: "./assets/images/grocery.png",
  },
  extra: {
    mockApi: process.env.EXPO_BASE_API_URL,
    // Expose Google Cloud Vision API key for runtime fallback access
    // Prefer using EXPO_PUBLIC_GCV_API_KEY; it's safe to be embedded in the bundle
    gcvApiKey: process.env.EXPO_PUBLIC_GCV_API_KEY,
    eas: {
      projectId: "bcf3c0cc-9a1c-4b37-ad57-333a0def12ca",
    },
  },
};