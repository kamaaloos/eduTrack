import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { SchoolFirebaseConfig, SchoolRecord } from "../types/school";
import { getDefaultFirebaseConfig, registryDb } from "./firebase";
import { mapSchoolRegistryDoc } from "./schoolRegistryMappers";

const COLLECTION = "schoolRegistry";

export async function loadActiveSchools(): Promise<SchoolRecord[]> {
  if (registryDb) {
    try {
      const schoolsQuery = query(
        collection(registryDb, COLLECTION),
        where("active", "==", true),
      );
      const snapshot = await getDocs(schoolsQuery);
      const schools = snapshot.docs
        .map((docSnap) => mapSchoolRegistryDoc(docSnap.id, docSnap.data()))
        .filter((school): school is SchoolRecord => school !== null)
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

/** Fresh registry metadata for the selected school (usage expiry, name). */
export async function getSchoolRegistryEntry(
  schoolId: string,
): Promise<Pick<SchoolRecord, "id" | "name" | "usageExpiresAt"> | null> {
  if (!schoolId || schoolId === "default" || !registryDb) return null;
  try {
    const snap = await getDoc(doc(registryDb, COLLECTION, schoolId));
    if (!snap.exists()) return null;
    const mapped = mapSchoolRegistryDoc(snap.id, snap.data());
    if (!mapped) return null;
    return {
      id: mapped.id,
      name: mapped.name,
      usageExpiresAt: mapped.usageExpiresAt ?? null,
    };
  } catch (err) {
    console.warn("getSchoolRegistryEntry failed:", err);
    return null;
  }
}

