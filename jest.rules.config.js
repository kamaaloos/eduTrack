/** @type {import('jest').Config} */
module.exports = {
  ...require("./jest.config.js"),
  testMatch: ["<rootDir>/tests/firestoreRules/**/*.test.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.expo/"],
};
