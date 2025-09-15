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
    eas: {
      projectId: "bcf3c0cc-9a1c-4b37-ad57-333a0def12ca",
    },
  },
};