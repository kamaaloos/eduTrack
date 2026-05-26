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
import type { SchoolFirebaseConfig, SchoolRecord } from "../types/school";
import { registryDb } from "./firebase";

const COLLECTION = "schoolRegistry";

function normalizeFirebaseConfig(raw: unknown): SchoolFirebaseConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const config: SchoolFirebaseConfig = {
    apiKey: String(data.apiKey ?? "").trim(),
    authDomain: String(data.authDomain ?? "").trim(),
    projectId: String(data.projectId ?? "").trim(),
    storageBucket: String(data.storageBucket ?? "").trim(),
    messagingSenderId: String(data.messagingSenderId ?? "").trim(),
    appId: String(data.appId ?? "").trim(),
  };
  if (!config.apiKey || !config.projectId) return null;
  return config;
}

function mapSchoolDoc(id: string, data: Record<string, unknown>): SchoolRecord | null {
  const firebase = normalizeFirebaseConfig(data.firebase);
  if (!firebase) return null;
  return {
    id,
    name: String(data.name ?? "School"),
    active: data.active !== false,
    firebase,
    logoUrl: data.logoUrl ? String(data.logoUrl) : null,
    city: data.city ? String(data.city) : null,
  };
}

export type SchoolRegistryInput = {
  name: string;
  city?: string;
  active: boolean;
  firebase: SchoolFirebaseConfig;
};

export async function listAllSchoolsForAdmin(): Promise<SchoolRecord[]> {
  const snapshot = await getDocs(collection(registryDb, COLLECTION));
  return snapshot.docs
    .map((docSnap) => mapSchoolDoc(docSnap.id, docSnap.data()))
    .filter((school): school is SchoolRecord => school !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSchoolForAdmin(
  schoolId: string,
): Promise<SchoolRecord | null> {
  const snap = await getDoc(doc(registryDb, COLLECTION, schoolId));
  if (!snap.exists()) return null;
  return mapSchoolDoc(snap.id, snap.data());
}

export async function createSchoolRecord(
  input: SchoolRegistryInput,
): Promise<string> {
  const docRef = await addDoc(collection(registryDb, COLLECTION), {
    name: input.name.trim(),
    city: input.city?.trim() || null,
    active: input.active,
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

export function validateSchoolInput(input: SchoolRegistryInput): string | null {
  if (!input.name.trim()) return "School name is required.";
  if (!input.firebase.apiKey.trim()) return "Firebase API key is required.";
  if (!input.firebase.projectId.trim()) return "Firebase project ID is required.";
  if (!input.firebase.authDomain.trim()) return "Firebase auth domain is required.";
  if (!input.firebase.appId.trim()) return "Firebase app ID is required.";
  return null;
}
