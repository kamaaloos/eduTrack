import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { SchoolFirebaseConfig, SchoolRecord } from "../types/school";
import { getDefaultFirebaseConfig, registryDb } from "../services/firebase";

const COLLECTION = "schoolRegistry";

function normalizeFirebaseConfig(raw: unknown): SchoolFirebaseConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const config: SchoolFirebaseConfig = {
    apiKey: String(data.apiKey ?? ""),
    authDomain: String(data.authDomain ?? ""),
    projectId: String(data.projectId ?? ""),
    storageBucket: String(data.storageBucket ?? ""),
    messagingSenderId: String(data.messagingSenderId ?? ""),
    appId: String(data.appId ?? ""),
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

export async function loadActiveSchools(): Promise<SchoolRecord[]> {
  try {
    const schoolsQuery = query(
      collection(registryDb, COLLECTION),
      where("active", "==", true),
    );
    const snapshot = await getDocs(schoolsQuery);
    const schools = snapshot.docs
      .map((docSnap) => mapSchoolDoc(docSnap.id, docSnap.data()))
      .filter((school): school is SchoolRecord => school !== null)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (schools.length > 0) {
      return schools;
    }
  } catch (err) {
    console.warn("schoolRegistry load failed, using default project:", err);
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
      firebase: fallback,
    },
  ];
}

export async function getSchoolById(schoolId: string): Promise<SchoolRecord | null> {
  const schools = await loadActiveSchools();
  return schools.find((school) => school.id === schoolId) ?? null;
}
