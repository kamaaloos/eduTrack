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

/** Keep in sync with `src/utils/schoolSubscriptionAccess.ts`. */
export const USAGE_ACTIVATION_GRACE_DAYS = 7;

/** Keep in sync with `src/utils/schoolSubscriptionAccess.ts`. */
function getUsageRemainingDays(
  usageExpiresAt: string | null | undefined,
): number | null {
  if (!usageExpiresAt) return null;
  const trimmed = usageExpiresAt.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const expiryStart = new Date(y, m - 1, d);
    const diffMs = expiryStart.getTime() - todayStart.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  const expiry = new Date(trimmed);
  if (Number.isNaN(expiry.getTime())) return null;
  const diffMs = expiry.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
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
    if (days >= 0) return null;
    const graceRemaining = USAGE_ACTIVATION_GRACE_DAYS + days;
    if (graceRemaining >= 0) return null;
    return "testing_expired";
  }

  return "missing_period";
}

export function isSchoolEntitled(school: SchoolSubscriptionFields): boolean {
  return getSchoolSubscriptionBlockReason(school) === null;
}

export function normalizeRegistryDate(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    const date = (value as { toDate: () => Date }).toDate();
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 10);
  }
  return null;
}

export function toSchoolSubscriptionFields(
  data: Record<string, unknown>,
): SchoolSubscriptionFields {
  return {
    active: data.active !== false,
    testingExpiresAt: normalizeRegistryDate(data.testingExpiresAt),
    usageExpiresAt: normalizeRegistryDate(data.usageExpiresAt),
  };
}
