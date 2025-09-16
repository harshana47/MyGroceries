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
      projectId: "e6b3adab-2ebc-4132-99e8-c95e63e90458",
    },
  },
};