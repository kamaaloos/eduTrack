const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const brand = (process.env.EXPO_PUBLIC_APP_BRAND || "edutrack")
  .trim()
  .toLowerCase();
const isDugsi = brand === "dugsi";

// Node-only packages — exclude from the mobile bundle (faster Metro + HMR)
const blockList = [
  /node_modules[\\/]firebase-admin[\\/].*/,
  // High-res sources — encode to *-web.mp4; never bundle raw masters
  /assets[\\/].*\.source\.png$/,
  /assets[\\/]edutrack2\.mp4$/,
  /assets[\\/]edutrack-promo2-full\.mp4$/,
  /assets[\\/]edutrack\.mp4$/,
  /assets[\\/]edutrack-ar\.mp4$/,
  /assets[\\/]edutrack-promo\.mp4$/,
  /assets[\\/]dugsi\.mp4$/,
  /assets[\\/]dugsi-ar\.mp4$/,
  /assets[\\/]dugsi-so\.mp4$/,
  /assets[\\/]dugsi-fi\.mp4$/,
  // Web-only landing clips (served from /videos/, not require()'d on native)
  /assets[\\/]edutrack-promo2\.mp4$/,
  /assets[\\/]edutrack2-web\.mp4$/,
];

// One brand per native build — drop the other brand's promo clips
if (isDugsi) {
  blockList.push(/assets[\\/]edutrack-.*\.mp4$/);
} else {
  blockList.push(/assets[\\/]dugsi-.*\.mp4$/);
}

config.resolver.blockList = Array.isArray(config.resolver.blockList)
  ? [...config.resolver.blockList, ...blockList]
  : config.resolver.blockList
    ? [config.resolver.blockList, ...blockList]
    : blockList;

const stubPromoVideos = path.resolve(__dirname, "scripts/stubs/emptyPromoVideos.js");

// react-native-qrcode-svg imports "qrcode"; default entry pulls Node pngjs (crashes Hermes).
const { resolveRequest } = config.resolver;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "./promoVideos.dugsi" ||
    moduleName.endsWith("/promoVideos.dugsi")
  ) {
    if (!isDugsi) {
      return { filePath: stubPromoVideos, type: "sourceFile" };
    }
  }
  if (
    moduleName === "./promoVideos.edutrack" ||
    moduleName.endsWith("/promoVideos.edutrack")
  ) {
    if (isDugsi) {
      return { filePath: stubPromoVideos, type: "sourceFile" };
    }
  }
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
