let getDefaultConfig;
try {
	// In local/root builds, resolve from root node_modules
	({ getDefaultConfig } = require("expo/metro-config"));
} catch (e) {
	// On EAS when only my-groceries has node_modules, delegate to its config
	// This avoids requiring expo/metro-config from the root.
	module.exports = require("./my-groceries/metro.config.js");
	return;
}

const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
