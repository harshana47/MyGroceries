module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    // Important: Reanimated plugin must be listed last
    plugins: ["react-native-reanimated/plugin"],
  };
};
