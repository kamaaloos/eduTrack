import { getUsageRemainingDays } from "./usageExpiry";

export type SubscriptionStatus = "not_set" | "expired" | "expiring" | "active";

export function getSubscriptionStatus(
  usageExpiresAt: string | null | undefined,
): SubscriptionStatus {
  const days = getUsageRemainingDays(usageExpiresAt);
  if (days == null) return "not_set";
  if (days < 0) return "expired";
  if (days <= 7) return "expiring";
  return "active";
}

export function formatUsageExpiryDate(
  usageExpiresAt: string | null | undefined,
): string | null {
  if (!usageExpiresAt?.trim()) return null;
  const trimmed = usageExpiresAt.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
