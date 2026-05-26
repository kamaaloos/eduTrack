const { getDefaultConfig } = require("expo/metro-config");

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

module.exports = config;
