import { parseFirestoreDate } from "./academicFilters";

export type MonthChipOption = { value: string; label: string };

export function dateKeyFromValue(value: unknown): string | undefined {
  const parsed = parseFirestoreDate(
    value as Parameters<typeof parseFirestoreDate>[0],
  );
  if (!parsed) return undefined;
  return parsed.toISOString().slice(0, 10);
}

export function monthKeyFromDateKey(dateKey?: string): string | undefined {
  if (!dateKey || dateKey.length < 7) return undefined;
  return dateKey.slice(0, 7);
}

export function monthKeyFromDateLabel(dateLabel?: string): string | undefined {
  if (!dateLabel?.trim()) return undefined;
  const parsed = new Date(dateLabel);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 7);
}

export function buildMonthOptions(
  monthKeys: string[],
  locale: string,
): MonthChipOption[] {
  const unique = [...new Set(monthKeys.filter(Boolean))].sort((a, b) =>
    b.localeCompare(a),
  );

  return unique.map((key) => {
    const [year, month] = key.split("-").map(Number);
    const label = new Date(year, month - 1, 1).toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });
    return { value: key, label };
  });
}

export function pickDefaultMonthKey(available: string[]): string {
  const now = new Date().toISOString().slice(0, 7);
  if (available.includes(now)) return now;
  return available[0] ?? now;
}
