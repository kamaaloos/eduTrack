import {
  parseOptionalUserCount,
  validateSchoolInput,
  type SchoolRegistryInput,
} from "../src/services/schoolRegistryValidation";

const validInput: SchoolRegistryInput = {
  name: "Test School",
  active: true,
  usageExpiresAt: "2026-12-31",
  userCount: null,
  firebase: {
    apiKey: "key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test.appspot.com",
    messagingSenderId: "123",
    appId: "app-id",
  },
};

describe("parseOptionalUserCount", () => {
  it("returns null for empty input", () => {
    expect(parseOptionalUserCount("")).toBeNull();
    expect(parseOptionalUserCount("   ")).toBeNull();
  });

  it("parses non-negative integers", () => {
    expect(parseOptionalUserCount("0")).toBe(0);
    expect(parseOptionalUserCount(" 42 ")).toBe(42);
  });

  it("rejects invalid values", () => {
    expect(parseOptionalUserCount("-1")).toBeUndefined();
    expect(parseOptionalUserCount("12.5")).toBeUndefined();
    expect(parseOptionalUserCount("abc")).toBeUndefined();
  });
});

describe("validateSchoolInput userCount", () => {
  it("accepts null userCount", () => {
    expect(validateSchoolInput(validInput)).toBeNull();
  });

  it("accepts zero and positive integers", () => {
    expect(
      validateSchoolInput({ ...validInput, userCount: 0 }),
    ).toBeNull();
    expect(
      validateSchoolInput({ ...validInput, userCount: 99 }),
    ).toBeNull();
  });

  it("rejects negative or fractional userCount", () => {
    expect(
      validateSchoolInput({ ...validInput, userCount: -1 }),
    ).toMatch(/whole number/i);
    expect(
      validateSchoolInput({ ...validInput, userCount: 1.5 }),
    ).toMatch(/whole number/i);
  });
});
