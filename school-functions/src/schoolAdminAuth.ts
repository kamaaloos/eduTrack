import type { Firestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

export type SchoolUserRole = "student" | "teacher" | "parent" | "admin";

export const SCHOOL_ROLES: SchoolUserRole[] = [
  "student",
  "teacher",
  "parent",
  "admin",
];

export function parseRole(value: unknown): SchoolUserRole | null {
  if (typeof value !== "string") return null;
  const role = value.trim() as SchoolUserRole;
  return SCHOOL_ROLES.includes(role) ? role : null;
}

export async function assertSchoolAdmin(
  db: Firestore,
  uid: string,
): Promise<void> {
  const profile = await db.collection("users").doc(uid).get();
  if (!profile.exists || profile.data()?.role !== "admin") {
    throw new HttpsError("permission-denied", "School admin required.");
  }
}
