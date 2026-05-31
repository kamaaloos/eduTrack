jest.mock("expo-image-picker", () => ({}));
jest.mock("firebase/storage", () => ({}));
jest.mock("../src/utils/readImageBytes", () => ({}));
jest.mock("../src/services/firebase", () => ({
  registryAuth: null,
  registryStorage: null,
}));

import { schoolLogoStoragePath } from "../src/services/schoolLogo";

describe("schoolLogoStoragePath", () => {
  it("uses jpg by default", () => {
    expect(schoolLogoStoragePath("abc123", "image/jpeg")).toBe(
      "schoolLogos/abc123/logo.jpg",
    );
  });

  it("uses png for image/png", () => {
    expect(schoolLogoStoragePath("abc123", "image/png")).toBe(
      "schoolLogos/abc123/logo.png",
    );
  });

  it("uses webp for image/webp", () => {
    expect(schoolLogoStoragePath("abc123", "image/webp")).toBe(
      "schoolLogos/abc123/logo.webp",
    );
  });
});
