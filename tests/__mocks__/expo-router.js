/** Jest stub for expo-router in node tests. */
const router = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
};

module.exports = {
  router,
  useRouter: () => router,
  useLocalSearchParams: () => ({}),
};
