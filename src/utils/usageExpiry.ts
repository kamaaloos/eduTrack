/** Days until usage expiry (calendar days in local time; expiry day counts as 0 when today). */
export function getUsageRemainingDays(
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
