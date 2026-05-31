import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import type { SchoolRecord } from "../types/school";
import { registryDb } from "./firebase";
import { mapSchoolRegistryDoc } from "./schoolRegistryMappers";
import type { SchoolRegistryInput } from "./schoolRegistryValidation";
import { registryUsageExpiresAt } from "./schoolRegistryValidation";
import { validateUsageExpiryDate } from "../utils/validation";

export type { SchoolRegistryInput } from "./schoolRegistryValidation";
export { validateSchoolInput } from "./schoolRegistryValidation";

const COLLECTION = "schoolRegistry";

function requireRegistryDb() {
  if (!registryDb) {
    throw new Error("Firebase registry is not configured");
  }
  return registryDb;
}

export async function listAllSchoolsForAdmin(): Promise<SchoolRecord[]> {
  const db = requireRegistryDb();
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs
    .map((docSnap) => mapSchoolRegistryDoc(docSnap.id, docSnap.data()))
    .filter((school): school is SchoolRecord => school !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSchoolForAdmin(
  schoolId: string,
): Promise<SchoolRecord | null> {
  const db = requireRegistryDb();
  const snap = await getDoc(doc(db, COLLECTION, schoolId));
  if (!snap.exists()) return null;
  return mapSchoolRegistryDoc(snap.id, snap.data());
}

export async function createSchoolRecord(
  input: SchoolRegistryInput,
): Promise<string> {
  const db = requireRegistryDb();
  const docRef = await addDoc(collection(db, COLLECTION), {
    name: input.name.trim(),
    city: input.city?.trim() || null,
    logoUrl: input.logoUrl?.trim() || null,
    active: input.active,
    testingExpiresAt: input.testingExpiresAt.trim(),
    usageExpiresAt: registryUsageExpiresAt(input),
    userCount: input.userCount,
    firebase: input.firebase,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSchoolRecord(
  schoolId: string,
  input: SchoolRegistryInput,
): Promise<void> {
  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    name: input.name.trim(),
    city: input.city?.trim() || null,
    logoUrl: input.logoUrl?.trim() || null,
    active: input.active,
    testingExpiresAt: input.testingExpiresAt.trim(),
    usageExpiresAt: registryUsageExpiresAt(input),
    userCount: input.userCount,
    firebase: input.firebase,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSchoolRecord(schoolId: string): Promise<void> {
  const db = requireRegistryDb();
  await deleteDoc(doc(db, COLLECTION, schoolId));
}

export async function setSchoolActive(
  schoolId: string,
  active: boolean,
): Promise<void> {
  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    active,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSchoolTestingPeriod(
  schoolId: string,
  testingExpiresAt: string,
): Promise<void> {
  const trimmed = testingExpiresAt.trim();
  if (!trimmed) {
    throw new Error("Testing period end date is required.");
  }
  if (!validateUsageExpiryDate(trimmed)) {
    throw new Error("Testing period end date must be YYYY-MM-DD.");
  }

  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    testingExpiresAt: trimmed,
    updatedAt: serverTimestamp(),
  });
}

export async function updateSchoolUsagePeriod(
  schoolId: string,
  usageExpiresAt: string,
): Promise<void> {
  const trimmed = usageExpiresAt.trim();
  if (trimmed && !validateUsageExpiryDate(trimmed)) {
    throw new Error("Usage expiry date must be YYYY-MM-DD.");
  }

  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    usageExpiresAt: trimmed || null,
    updatedAt: serverTimestamp(),
  });
}

