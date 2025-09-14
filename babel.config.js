module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      // Expo Router should be used as a preset in this setup
      "expo-router/babel",
    ],
    plugins: [
      "nativewind/babel",
      // IMPORTANT: worklets/reanimated plugin will be re-added after isolating current Babel error
    ],
  }
}