import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { SchoolFirebaseConfig, SchoolRecord } from "../types/school";
import { isSchoolEntitled } from "../utils/schoolSubscriptionAccess";
import { getDefaultFirebaseConfig, registryDb } from "./firebase";
import { mapSchoolRegistryDoc } from "./schoolRegistryMappers";

const COLLECTION = "schoolRegistry";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]);
}

export async function loadActiveSchools(): Promise<SchoolRecord[]> {
  if (registryDb) {
    try {
      const schoolsQuery = query(
        collection(registryDb, COLLECTION),
        where("active", "==", true),
      );
      const snapshot = await withTimeout(
        getDocs(schoolsQuery),
        5000,
        "schoolRegistry load",
      );
      const schools = snapshot.docs
        .map((docSnap) => mapSchoolRegistryDoc(docSnap.id, docSnap.data()))
        .filter((school): school is SchoolRecord => school !== null)
        .filter((school) => isSchoolEntitled(school))
        .sort((a, b) => a.name.localeCompare(b.name));

      if (schools.length > 0) {
        return schools;
      }
    } catch (err) {
      console.warn("schoolRegistry load failed, using default project:", err);
    }
  }

  const fallback = getDefaultFirebaseConfig();
  if (!fallback.apiKey || !fallback.projectId) {
    return [];
  }

  return [
    {
      id: "default",
      name: "Default School",
      active: true,
      firebase: fallback as SchoolFirebaseConfig,
    },
  ];
}

export async function getSchoolById(schoolId: string): Promise<SchoolRecord | null> {
  const schools = await loadActiveSchools();
  return schools.find((school) => school.id === schoolId) ?? null;
}

/** Fresh registry metadata for the selected school (subscription + name). */
export async function getSchoolRegistryEntry(
  schoolId: string,
): Promise<
  Pick<
    SchoolRecord,
    "id" | "name" | "active" | "testingExpiresAt" | "usageExpiresAt"
  > | null
> {
  if (!schoolId || schoolId === "default" || !registryDb) return null;
  try {
    const snap = await getDoc(doc(registryDb, COLLECTION, schoolId));
    if (!snap.exists()) return null;
    const mapped = mapSchoolRegistryDoc(snap.id, snap.data());
    if (!mapped) return null;
    return {
      id: mapped.id,
      name: mapped.name,
      active: mapped.active,
      testingExpiresAt: mapped.testingExpiresAt ?? null,
      usageExpiresAt: mapped.usageExpiresAt ?? null,
    };
  } catch (err) {
    console.warn("getSchoolRegistryEntry failed:", err);
    return null;
  }
}

