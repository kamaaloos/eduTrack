import {
  getRoleHomeRoute,
  isPublicEntrySegment,
} from "../src/utils/authNavigation";

describe("isPublicEntrySegment", () => {
  it("treats undefined as public entry", () => {
    expect(isPublicEntrySegment(undefined)).toBe(true);
  });

  it("recognizes onboarding, school select, login, super-admin", () => {
    expect(isPublicEntrySegment("onboarding")).toBe(true);
    expect(isPublicEntrySegment("select-school")).toBe(true);
    expect(isPublicEntrySegment("login")).toBe(true);
    expect(isPublicEntrySegment("super-admin")).toBe(true);
    expect(isPublicEntrySegment("privacy-policy")).toBe(true);
  });

  it("rejects role route groups", () => {
    expect(isPublicEntrySegment("(students)")).toBe(false);
    expect(isPublicEntrySegment("(teachers)")).toBe(false);
    expect(isPublicEntrySegment("(admin)")).toBe(false);
    expect(isPublicEntrySegment("(parent)")).toBe(false);
    expect(isPublicEntrySegment("(secretary)")).toBe(false);
  });
});

describe("getRoleHomeRoute", () => {
  it("maps each school role to its dashboard", () => {
    expect(getRoleHomeRoute("admin")).toBe("/(admin)/dashboard");
    expect(getRoleHomeRoute("teacher")).toBe("/(teachers)/dashboard");
    expect(getRoleHomeRoute("student")).toBe("/(students)/dashboard");
    expect(getRoleHomeRoute("parent")).toBe("/(parent)/dashboard");
    expect(getRoleHomeRoute("secretary")).toBe("/(secretary)/dashboard");
  });

  it("falls back to login for unknown roles", () => {
    expect(getRoleHomeRoute("superAdmin")).toBe("/login");
    expect(getRoleHomeRoute("")).toBe("/login");
  });
});

describe("platform routes", () => {
  const originalExpoOs = process.env.EXPO_OS;

  afterEach(() => {
    if (originalExpoOs === undefined) {
      delete process.env.EXPO_OS;
    } else {
      process.env.EXPO_OS = originalExpoOs;
    }
  });

  it("uses native routes when EXPO_OS is not web", () => {
    delete process.env.EXPO_OS;
    const { getPostLogoutRoute, getSignedOutRoute } = require("../src/utils/authNavigation");
    expect(getPostLogoutRoute()).toBe("/select-school");
    expect(getSignedOutRoute()).toBe("/login");
  });

  it("uses web routes when EXPO_OS is web", () => {
    process.env.EXPO_OS = "web";
    jest.resetModules();
    const { getPostLogoutRoute, getSignedOutRoute } = require("../src/utils/authNavigation");
    expect(getPostLogoutRoute()).toBe("/landing");
    expect(getSignedOutRoute()).toBe("/landing");
  });
});
