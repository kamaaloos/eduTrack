import type { SchoolSubscriptionFields } from "./schoolSubscriptionAccess";
import { USAGE_ACTIVATION_GRACE_DAYS } from "./schoolSubscriptionAccess";
import { getUsageRemainingDays } from "./usageExpiry";

export type AdminDashboardPeriodKind = "testing" | "usage" | "activation_grace";

export type AdminDashboardPeriodNotice = {
  kind: AdminDashboardPeriodKind;
  remainingDays: number;
};

/** Which single period card to show on the admin dashboard. */
export function resolveAdminDashboardPeriodNotice(
  school: SchoolSubscriptionFields,
): AdminDashboardPeriodNotice | null {
  const testingRemaining = getUsageRemainingDays(school.testingExpiresAt);
  const hasUsage = Boolean(school.usageExpiresAt?.trim());
  const hasTesting = Boolean(school.testingExpiresAt?.trim());

  if (hasTesting && testingRemaining != null && testingRemaining >= 0) {
    return { kind: "testing", remainingDays: testingRemaining };
  }

  if (hasUsage) {
    const usageRemaining = getUsageRemainingDays(school.usageExpiresAt);
    if (usageRemaining != null) {
      return { kind: "usage", remainingDays: usageRemaining };
    }
  }

  if (hasTesting && testingRemaining != null && testingRemaining < 0) {
    return {
      kind: "activation_grace",
      remainingDays: USAGE_ACTIVATION_GRACE_DAYS + testingRemaining,
    };
  }

  return null;
}

export function isTestingPeriodActive(
  school: SchoolSubscriptionFields,
): boolean {
  const testingRemaining = getUsageRemainingDays(school.testingExpiresAt);
  return (
    Boolean(school.testingExpiresAt?.trim()) &&
    testingRemaining != null &&
    testingRemaining >= 0
  );
}
