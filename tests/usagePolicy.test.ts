import {
  ADMIN_USAGE_POLICY_ROUTE,
  adminMustAcceptUsagePolicy,
} from "../src/utils/usagePolicy";
import {
  CHANGE_PASSWORD_ROUTE,
  getPostLoginRoute,
} from "../src/utils/authNavigation";

describe("adminMustAcceptUsagePolicy", () => {
  it("is true only for admins without the current policy version", () => {
    expect(adminMustAcceptUsagePolicy({ role: "admin" })).toBe(true);
    expect(
      adminMustAcceptUsagePolicy({ role: "admin", usagePolicyAcceptedVersion: "0.9" }),
    ).toBe(true);
    expect(
      adminMustAcceptUsagePolicy({ role: "admin", usagePolicyAcceptedVersion: "1.0" }),
    ).toBe(true);
    expect(
      adminMustAcceptUsagePolicy({ role: "admin", usagePolicyAcceptedVersion: "1.1" }),
    ).toBe(true);
    expect(
      adminMustAcceptUsagePolicy({ role: "admin", usagePolicyAcceptedVersion: "1.2" }),
    ).toBe(false);
    expect(adminMustAcceptUsagePolicy({ role: "teacher" })).toBe(false);
    expect(adminMustAcceptUsagePolicy(null)).toBe(false);
  });
});

describe("getPostLoginRoute with usage policy", () => {
  it("sends admins without acceptance to the usage policy screen", () => {
    expect(getPostLoginRoute("admin", { role: "admin" })).toBe(
      ADMIN_USAGE_POLICY_ROUTE,
    );
    expect(
      getPostLoginRoute("admin", {
        role: "admin",
        usagePolicyAcceptedVersion: "1.2",
      }),
    ).toBe("/(admin)/dashboard");
  });

  it("keeps password change ahead of usage policy", () => {
    expect(
      getPostLoginRoute("admin", {
        role: "admin",
        mustChangePassword: true,
      }),
    ).toBe(CHANGE_PASSWORD_ROUTE);
  });

  it("does not send teachers or parents to the usage policy screen", () => {
    expect(getPostLoginRoute("teacher", { role: "teacher" })).toBe(
      "/(teachers)/dashboard",
    );
    expect(getPostLoginRoute("parent", { role: "parent" })).toBe(
      "/(parent)/dashboard",
    );
  });
});
