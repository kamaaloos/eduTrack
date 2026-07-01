import { USAGE_POLICY_VERSION } from "../constants/usagePolicy";

export const ADMIN_USAGE_POLICY_ROUTE = "/admin-usage-policy";

export const USAGE_POLICY_ACCEPTED_VERSION_FIELD = "usagePolicyAcceptedVersion";
export const USAGE_POLICY_ACCEPTED_AT_FIELD = "usagePolicyAcceptedAt";

export type UsagePolicyUserData = {
  role?: string;
  mustChangePassword?: boolean;
  usagePolicyAcceptedVersion?: string;
} | null | undefined;

export function adminMustAcceptUsagePolicy(userData: UsagePolicyUserData): boolean {
  if (userData?.role !== "admin") {
    return false;
  }
  return userData.usagePolicyAcceptedVersion !== USAGE_POLICY_VERSION;
}

export function isAdminUsagePolicySegment(segment: string | undefined): boolean {
  return segment === "admin-usage-policy";
}
