module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Must be listed last — required for Reanimated + reliable Fast Refresh
      "react-native-reanimated/plugin",
    ],
  };
};
