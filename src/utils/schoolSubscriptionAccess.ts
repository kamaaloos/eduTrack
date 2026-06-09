import { getUsageRemainingDays } from "./usageExpiry";

export type SchoolSubscriptionBlockReason =
  | "inactive"
  | "testing_expired"
  | "usage_expired"
  | "missing_period";

export type SchoolSubscriptionFields = {
  active?: boolean;
  testingExpiresAt?: string | null;
  usageExpiresAt?: string | null;
};

/** Effective subscription end: paid usage date if set, otherwise trial/testing date. */
export function getEffectiveSubscriptionEndDate(
  school: SchoolSubscriptionFields,
): string | null {
  const usage = school.usageExpiresAt?.trim();
  if (usage) return usage;
  const testing = school.testingExpiresAt?.trim();
  return testing || null;
}

export function getSchoolSubscriptionBlockReason(
  school: SchoolSubscriptionFields,
): SchoolSubscriptionBlockReason | null {
  if (school.active === false) {
    return "inactive";
  }

  const usage = school.usageExpiresAt?.trim();
  if (usage) {
    const days = getUsageRemainingDays(usage);
    if (days == null) return "missing_period";
    if (days < 0) return "usage_expired";
    return null;
  }

  const testing = school.testingExpiresAt?.trim();
  if (testing) {
    const days = getUsageRemainingDays(testing);
    if (days == null) return "missing_period";
    if (days < 0) return "testing_expired";
    return null;
  }

  return "missing_period";
}

export function isSchoolEntitled(school: SchoolSubscriptionFields): boolean {
  return getSchoolSubscriptionBlockReason(school) === null;
}
