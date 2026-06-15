/** Jest stub — avoids parsing react-native ESM in node test environment. */
module.exports = {
  Platform: {
    OS: "ios",
    select: (specifics) => specifics.ios ?? specifics.default,
  },
};
