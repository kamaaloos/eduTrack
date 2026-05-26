/**
 * Unit Tests for Form Validation
 *
 * These tests verify input validation logic used across the app.
 * To run: jest tests/validation.test.ts
 */

// Validation functions
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    return password.length >= 6;
};

export const validateScore = (score: string): boolean => {
    const trimmed = score.trim();
    if (!trimmed) return false;
    const num = Number(trimmed);
    return !isNaN(num) && num >= 0 && num <= 100;
};

export const validateClassName = (name: string): boolean => {
    return name.trim().length > 0;
};

// Tests
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
        expect(validateEmail("user @example.com")).toBe(false);
    });

    it("should reject empty email", () => {
        expect(validateEmail("")).toBe(false);
    });
});

describe("Password Validation", () => {
    it("should accept passwords with 6+ characters", () => {
        expect(validatePassword("123456")).toBe(true);
        expect(validatePassword("securePassword123")).toBe(true);
    });

    it("should reject passwords shorter than 6 characters", () => {
        expect(validatePassword("123")).toBe(false);
        expect(validatePassword("pass")).toBe(false);
        expect(validatePassword("")).toBe(false);
    });
});

describe("Score Validation", () => {
    it("should accept scores between 0 and 100", () => {
        expect(validateScore("0")).toBe(true);
        expect(validateScore("50")).toBe(true);
        expect(validateScore("100")).toBe(true);
        expect(validateScore("85.5")).toBe(true);
    });

    it("should reject scores outside 0-100 range", () => {
        expect(validateScore("-5")).toBe(false);
        expect(validateScore("101")).toBe(false);
        expect(validateScore("150")).toBe(false);
    });

    it("should reject non-numeric scores", () => {
        expect(validateScore("abc")).toBe(false);
        expect(validateScore("")).toBe(false);
    });
});

describe("Class Name Validation", () => {
    it("should accept non-empty class names", () => {
        expect(validateClassName("Grade 10 A")).toBe(true);
        expect(validateClassName("Class 1")).toBe(true);
    });

    it("should reject empty class names", () => {
        expect(validateClassName("")).toBe(false);
        expect(validateClassName("   ")).toBe(false);
    });
});
