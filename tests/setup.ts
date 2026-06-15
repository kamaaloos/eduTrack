jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
    select: (specifics: { ios?: unknown; android?: unknown; default?: unknown }) =>
      specifics.ios ?? specifics.default,
  },
}));

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));
