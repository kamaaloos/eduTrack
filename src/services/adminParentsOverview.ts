import { collection, getDocs } from "firebase/firestore";
import type { UserData } from "../../hooks/useAdminUsers";
import { db } from "./firebase";
import {
  countPaidMonthsInYear,
  parseFeeMonths,
} from "./parentFeePayments";

export type ParentOverviewRow = {
  id: string;
  name: string;
  contact: string;
  linkedStudentCount: number;
  feePaid: boolean;
  paidMonthsThisYear: number;
};

const currentYear = () => new Date().getFullYear();

export async function loadParentStudentCounts(): Promise<Map<string, number>> {
  const snap = await getDocs(collection(db, "parentStudents"));
  const counts = new Map<string, number>();

  for (const linkDoc of snap.docs) {
    const data = linkDoc.data();
    let parentId = data.parentId as string | undefined;
    const studentId = data.studentId as string | undefined;

    if (!parentId && studentId) {
      parentId = linkDoc.id;
    }
    if (!parentId || !studentId) continue;

    counts.set(parentId, (counts.get(parentId) ?? 0) + 1);
  }

  return counts;
}

function parentContact(parent: UserData): string {
  const email = parent.email?.trim();
  const phone = typeof parent.phone === "string" ? parent.phone.trim() : "";
  if (email && phone) return `${email} · ${phone}`;
  return email || phone || "—";
}

function linkedCount(parent: UserData, counts: Map<string, number>): number {
  const fromLinks = counts.get(parent.id) ?? 0;
  const fromProfile = Array.isArray(parent.linkedStudentIds)
    ? parent.linkedStudentIds.length
    : 0;
  return Math.max(fromLinks, fromProfile);
}

export function buildParentOverviewRows(
  parents: UserData[],
  counts: Map<string, number>,
): ParentOverviewRow[] {
  return parents
    .map((parent) => ({
      id: parent.id,
      name: parent.name?.trim() || parent.email || "—",
      contact: parentContact(parent),
      linkedStudentCount: linkedCount(parent, counts),
      feePaid: parent.feePaid === true,
      paidMonthsThisYear: countPaidMonthsInYear(
        parseFeeMonths(parent.feeMonths),
        currentYear(),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
