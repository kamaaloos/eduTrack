/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
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
  clearMocks: true,
};
