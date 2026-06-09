import {
  validateSchoolInput,
  type SchoolRegistryInput,
} from "../src/services/schoolRegistryValidation";

const validFirebase = {
  apiKey: "key",
  authDomain: "x.firebaseapp.com",
  projectId: "project",
  storageBucket: "project.appspot.com",
  messagingSenderId: "123",
  appId: "1:123:web:abc",
};

const baseInput: SchoolRegistryInput = {
  name: "Test School",
  active: true,
  testingExpiresAt: "2026-06-30",
  usageExpiresAt: "2026-12-31",
  userCount: null,
  firebase: validFirebase,
};

describe("validateSchoolInput", () => {
  it("accepts valid input", () => {
    expect(validateSchoolInput(baseInput)).toBeNull();
  });

  it("requires school name", () => {
    expect(validateSchoolInput({ ...baseInput, name: "  " })).toMatch(/name/i);
  });

  it("requires YYYY-MM-DD testing expiry", () => {
    expect(
      validateSchoolInput({ ...baseInput, testingExpiresAt: "31-12-2026" }),
    ).toMatch(/YYYY-MM-DD/i);
  });

  it("allows empty registered usage expiry", () => {
    expect(
      validateSchoolInput({ ...baseInput, usageExpiresAt: "" }),
    ).toBeNull();
  });

  it("requires YYYY-MM-DD usage expiry when set", () => {
    expect(
      validateSchoolInput({ ...baseInput, usageExpiresAt: "31-12-2026" }),
    ).toMatch(/YYYY-MM-DD/i);
  });

  it("requires firebase project id", () => {
    expect(
      validateSchoolInput({
        ...baseInput,
        firebase: { ...validFirebase, projectId: "" },
      }),
    ).toMatch(/project/i);
  });

  it("rejects non-http logo url", () => {
    expect(
      validateSchoolInput({
        ...baseInput,
        logoUrl: "ftp://example.com/logo.png",
      }),
    ).toMatch(/logo/i);
  });
});
