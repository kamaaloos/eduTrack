export const Platform = {
  OS: "ios" as const,
  select: <T>(specifics: {
    ios?: T;
    android?: T;
    web?: T;
    default?: T;
  }): T | undefined => specifics.ios ?? specifics.default,
};
