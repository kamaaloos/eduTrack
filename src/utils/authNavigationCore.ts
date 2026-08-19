import { userMustChangePassword } from "./mustChangePassword";
import {
  ADMIN_USAGE_POLICY_ROUTE,
  adminMustAcceptUsagePolicy,
} from "./usagePolicy";

export const CHANGE_PASSWORD_ROUTE = "/change-password";

const PUBLIC_ENTRY_SEGMENTS = new Set([
  "landing",
  "onboarding",
  "select-school",
  "login",
  "super-admin",
  "about",
  "contact",
  "download",
  "faq",
  "privacy-policy",
]);

export function isPublicEntrySegment(segment: string | undefined): boolean {
  if (!segment) return true;
  return PUBLIC_ENTRY_SEGMENTS.has(segment);
}

export function getRoleHomeRoute(role: string): string {
  switch (role) {
    case "admin":
      return "/(admin)/dashboard";
    case "teacher":
      return "/(teachers)/dashboard";
    case "student":
      return "/(students)/dashboard";
    case "parent":
      return "/(parent)/dashboard";
    case "secretary":
      return "/(secretary)/dashboard";
    default:
      return "/login";
  }
}

/** Route after sign-in: forced password change, then admin usage policy, then role home. */
export function getPostLoginRoute(
  role: string,
  userData:
    | {
        mustChangePassword?: boolean;
        role?: string;
        usagePolicyAcceptedVersion?: string;
      }
    | null
    | undefined,
): string {
  if (userMustChangePassword(userData)) {
    return CHANGE_PASSWORD_ROUTE;
  }
  if (adminMustAcceptUsagePolicy(userData)) {
    return ADMIN_USAGE_POLICY_ROUTE;
  }
  return getRoleHomeRoute(role);
}

export function isChangePasswordSegment(segment: string | undefined): boolean {
  return segment === "change-password";
}

export function isAdminUsagePolicySegment(segment: string | undefined): boolean {
  return segment === "admin-usage-policy";
}
