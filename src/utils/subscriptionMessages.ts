import type { SchoolSubscriptionBlockReason } from "./schoolSubscriptionAccess";

export function subscriptionBlockMessageKey(
  reason: SchoolSubscriptionBlockReason | null,
): string {
  switch (reason) {
    case "inactive":
      return "common.subscriptionInactive";
    case "testing_expired":
      return "common.subscriptionTestingExpired";
    case "usage_expired":
      return "common.subscriptionUsageExpired";
    case "missing_period":
      return "common.subscriptionMissingPeriod";
    default:
      return "common.subscriptionExpired";
  }
}
