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

export type { SchoolRegistryInput } from "./schoolRegistryValidation";
export { validateSchoolInput } from "./schoolRegistryValidation";

const COLLECTION = "schoolRegistry";

export async function listAllSchoolsForAdmin(): Promise<SchoolRecord[]> {
  const snapshot = await getDocs(collection(registryDb, COLLECTION));
  return snapshot.docs
    .map((docSnap) => mapSchoolRegistryDoc(docSnap.id, docSnap.data()))
    .filter((school): school is SchoolRecord => school !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSchoolForAdmin(
  schoolId: string,
): Promise<SchoolRecord | null> {
  const snap = await getDoc(doc(registryDb, COLLECTION, schoolId));
  if (!snap.exists()) return null;
  return mapSchoolRegistryDoc(snap.id, snap.data());
}

export async function createSchoolRecord(
  input: SchoolRegistryInput,
): Promise<string> {
  const docRef = await addDoc(collection(registryDb, COLLECTION), {
    name: input.name.trim(),
    city: input.city?.trim() || null,
    active: input.active,
    usageExpiresAt: input.usageExpiresAt,
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
  await updateDoc(doc(registryDb, COLLECTION, schoolId), {
    name: input.name.trim(),
    city: input.city?.trim() || null,
    active: input.active,
    usageExpiresAt: input.usageExpiresAt,
    firebase: input.firebase,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSchoolRecord(schoolId: string): Promise<void> {
  await deleteDoc(doc(registryDb, COLLECTION, schoolId));
}

export async function setSchoolActive(
  schoolId: string,
  active: boolean,
): Promise<void> {
  await updateDoc(doc(registryDb, COLLECTION, schoolId), {
    active,
    updatedAt: serverTimestamp(),
  });
}

