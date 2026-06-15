/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  testPathIgnorePatterns: ["<rootDir>/tests/firestoreRules/"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          esModuleInterop: true,
          isolatedModules: true,
        },
      },
    ],
  },
  modulePathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.expo/"],
  moduleNameMapper: {
    "^react-native$": "<rootDir>/tests/__mocks__/react-native.ts",
    "^expo-router$": "<rootDir>/tests/__mocks__/expo-router.ts",
  },
  collectCoverageFrom: [
    "src/utils/**/*.ts",
    "src/services/schoolRegistryMappers.ts",
    "src/services/schoolRegistryValidation.ts",
    "!**/*.d.ts",
  ],
  clearMocks: true,
};
