import {
  canUploadProfilePhoto,
  getInitials,
} from "../src/utils/userAvatar";

describe("getInitials", () => {
  it("uses first letters of first and last name", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });

  it("uses single letter for one name", () => {
    expect(getInitials("Ada")).toBe("A");
  });

  it("falls back to email", () => {
    expect(getInitials(null, "ada@school.edu")).toBe("A");
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
