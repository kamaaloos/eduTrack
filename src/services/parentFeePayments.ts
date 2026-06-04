import { doc, getDoc, setDoc } from "firebase/firestore";
import { requireSchoolDb } from "./firebase";

export type FeeMonthsMap = Record<string, boolean>;

export function feeMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseFeeMonths(raw: unknown): FeeMonthsMap {
  if (!raw || typeof raw !== "object") return {};
  const out: FeeMonthsMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value === true) out[key] = true;
  }
  return out;
}

export function countPaidMonthsInYear(map: FeeMonthsMap, year: number): number {
  let count = 0;
  for (let month = 1; month <= 12; month++) {
    if (map[feeMonthKey(year, month)]) count++;
  }
  return count;
}

/**
 * feePaid means “current calendar month is paid”. Older records may only have feePaid
 * without feeMonths — treat the current month as paid for counts and the calendar.
 */
export function effectiveFeeMonthsForYear(
  map: FeeMonthsMap,
  year: number,
  feePaid?: boolean,
  referenceDate: Date = new Date(),
): FeeMonthsMap {
  const merged = { ...map };
  if (feePaid !== true || year !== referenceDate.getFullYear()) {
    return merged;
  }
  merged[feeMonthKey(year, referenceDate.getMonth() + 1)] = true;
  return merged;
}

export function isCurrentCalendarMonth(year: number, month: number): boolean {
  const now = new Date();
  return year === now.getFullYear() && month === now.getMonth() + 1;
}

/** Derive dashboard fee flag and yearly count from a feeMonths map. */
export function feeStatusFromMonths(
  map: FeeMonthsMap,
  year: number,
  referenceDate: Date = new Date(),
): { feePaid: boolean; paidMonthsThisYear: number } {
  const currentKey = feeMonthKey(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
  );
  return {
    feePaid: map[currentKey] === true,
    paidMonthsThisYear: countPaidMonthsInYear(map, year),
  };
}

export function applyMonthToFeeMap(
  map: FeeMonthsMap,
  year: number,
  month: number,
  paid: boolean,
): FeeMonthsMap {
  const key = feeMonthKey(year, month);
  const next = { ...map };
  if (paid) next[key] = true;
  else delete next[key];
  return next;
}

export async function loadParentFeeMonths(parentId: string): Promise<FeeMonthsMap> {
  const snap = await getDoc(doc(requireSchoolDb(), "users", parentId));
  if (!snap.exists()) return {};
  return parseFeeMonths(snap.data().feeMonths);
}

export async function saveParentFeeMonths(
  parentId: string,
  feeMonths: FeeMonthsMap,
): Promise<void> {
  const now = new Date();
  const currentKey = feeMonthKey(now.getFullYear(), now.getMonth() + 1);
  await setDoc(
    doc(requireSchoolDb(), "users", parentId),
    {
      feeMonths,
      feePaid: feeMonths[currentKey] === true,
    },
    { merge: true },
  );
}

export async function setParentFeeMonthPaid(
  parentId: string,
  year: number,
  month: number,
  paid: boolean,
): Promise<FeeMonthsMap> {
  const current = await loadParentFeeMonths(parentId);
  const key = feeMonthKey(year, month);
  const next = { ...current };
  if (paid) next[key] = true;
  else delete next[key];
  await saveParentFeeMonths(parentId, next);
  return next;
}
