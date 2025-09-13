module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      "nativewind/babel",
      // Reanimated v4 moved the Babel plugin to react-native-worklets
      "react-native-worklets/plugin",
    ],
  };
};
