const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Node-only packages — exclude from the mobile bundle (faster Metro + HMR)
const blockList = [
  /node_modules[\\/]firebase-admin[\\/].*/,
];

config.resolver.blockList = Array.isArray(config.resolver.blockList)
  ? [...config.resolver.blockList, ...blockList]
  : config.resolver.blockList
    ? [config.resolver.blockList, ...blockList]
    : blockList;

// react-native-qrcode-svg imports "qrcode"; default entry pulls Node pngjs (crashes Hermes).
const { resolveRequest } = config.resolver;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "qrcode") {
    return {
      filePath: path.resolve(__dirname, "node_modules/qrcode/lib/browser.js"),
      type: "sourceFile",
    };
  }
  return resolveRequest
    ? resolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
