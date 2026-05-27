import {
  validateClassName,
  validateEmail,
  validatePassword,
  validateScore,
  validateUsageExpiryDate,
} from "../src/utils/validation";

describe("Email Validation", () => {
  it("should accept valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.user@domain.co.uk")).toBe(true);
    expect(validateEmail("admin@school.edu")).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
    expect(validateEmail("")).toBe(false);
  });
});

describe("Password Validation", () => {
  it("should accept passwords with 6+ characters", () => {
    expect(validatePassword("123456")).toBe(true);
    expect(validatePassword("password123")).toBe(true);
  });

  it("should reject short passwords", () => {
    expect(validatePassword("12345")).toBe(false);
    expect(validatePassword("")).toBe(false);
  });
});

describe("Score Validation", () => {
  it("should accept valid scores 0-100", () => {
    expect(validateScore("0")).toBe(true);
    expect(validateScore("50")).toBe(true);
    expect(validateScore("100")).toBe(true);
  });

  it("should reject invalid scores", () => {
    expect(validateScore("")).toBe(false);
    expect(validateScore("-1")).toBe(false);
    expect(validateScore("101")).toBe(false);
    expect(validateScore("abc")).toBe(false);
  });
});

describe("Class Name Validation", () => {
  it("should accept non-empty names", () => {
    expect(validateClassName("Grade 5A")).toBe(true);
  });

  it("should reject empty names", () => {
    expect(validateClassName("")).toBe(false);
    expect(validateClassName("   ")).toBe(false);
  });
});

describe("Usage expiry date validation", () => {
  it("accepts YYYY-MM-DD", () => {
    expect(validateUsageExpiryDate("2026-12-31")).toBe(true);
  });

  it("rejects other formats", () => {
    expect(validateUsageExpiryDate("31/12/2026")).toBe(false);
    expect(validateUsageExpiryDate("2026-1-1")).toBe(false);
  });
});
