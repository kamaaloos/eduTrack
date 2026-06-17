import {
  canUploadProfilePhoto,
  parsePhotoURL,
} from "../src/utils/userAvatar";

describe("parsePhotoURL", () => {
  it("returns trimmed url when valid", () => {
    expect(parsePhotoURL(" https://cdn.example/a.jpg ")).toBe(
      "https://cdn.example/a.jpg",
    );
  });

  it("returns null for empty or non-string values", () => {
    expect(parsePhotoURL(null)).toBeNull();
    expect(parsePhotoURL("")).toBeNull();
    expect(parsePhotoURL("   ")).toBeNull();
    expect(parsePhotoURL(undefined)).toBeNull();
  });
});

describe("canUploadProfilePhoto", () => {
  it("allows student and teacher only", () => {
    expect(canUploadProfilePhoto("student")).toBe(true);
    expect(canUploadProfilePhoto("teacher")).toBe(true);
    expect(canUploadProfilePhoto("parent")).toBe(false);
    expect(canUploadProfilePhoto("admin")).toBe(false);
  });
});
