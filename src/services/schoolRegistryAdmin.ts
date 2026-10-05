import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
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
import {
  refreshSchoolSubscriptionSync,
  type RefreshSubscriptionResult,
} from "./schoolSubscriptionSync";
import { DEFAULT_SCHOOL_THEME } from "../constants/schoolThemeDefaults";
import { resolveSchoolTheme, themeToFirestore } from "../utils/schoolTheme";
import { validateUsageExpiryDate } from "../utils/validation";

/** Pushes registry entitlement into school platform/subscription (Admin SDK via CF). */
async function syncPlatformSubscription(
  schoolId: string,
): Promise<RefreshSubscriptionResult> {
  const result = await refreshSchoolSubscriptionSync(schoolId);
  if (!result.ok) {
    throw new Error(
      result.error ||
        "Could not sync platform/subscription on the school Firebase project.",
    );
  }
  return result;
}

function clearSubscriptionDeactivationFields() {
  return {
    subscriptionBlockReason: deleteField(),
    subscriptionDeactivatedAt: deleteField(),
  };
}

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
  const theme = themeToFirestore(
    resolveSchoolTheme(input.theme ?? DEFAULT_SCHOOL_THEME),
  );
  const docRef = await addDoc(collection(db, COLLECTION), {
    name: input.name.trim(),
    country: input.country?.trim() || null,
    city: input.city?.trim() || null,
    logoUrl: input.logoUrl?.trim() || null,
    theme,
    active: input.active,
    testingExpiresAt: input.testingExpiresAt.trim(),
    usageExpiresAt: registryUsageExpiresAt(input),
    userCount: input.userCount,
    firebase: input.firebase,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await syncPlatformSubscription(docRef.id);
  return docRef.id;
}

export async function updateSchoolRecord(
  schoolId: string,
  input: SchoolRegistryInput,
): Promise<void> {
  const db = requireRegistryDb();
  const theme = themeToFirestore(
    resolveSchoolTheme(input.theme ?? DEFAULT_SCHOOL_THEME),
  );
  await updateDoc(doc(db, COLLECTION, schoolId), {
    name: input.name.trim(),
    country: input.country?.trim() || null,
    city: input.city?.trim() || null,
    logoUrl: input.logoUrl?.trim() || null,
    theme,
    active: input.active,
    testingExpiresAt: input.testingExpiresAt.trim(),
    usageExpiresAt: registryUsageExpiresAt(input),
    userCount: input.userCount,
    firebase: input.firebase,
    updatedAt: serverTimestamp(),
  });
  await syncPlatformSubscription(schoolId);
}

export async function deleteSchoolRecord(schoolId: string): Promise<void> {
  const db = requireRegistryDb();
  await deleteDoc(doc(db, COLLECTION, schoolId));
}

export async function setSchoolActive(
  schoolId: string,
  active: boolean,
): Promise<RefreshSubscriptionResult> {
  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    active,
    updatedAt: serverTimestamp(),
    ...(active ? clearSubscriptionDeactivationFields() : {}),
  });
  return syncPlatformSubscription(schoolId);
}

/**
 * Extends testing end date, reactivates the school, and syncs school
 * platform/subscription so login works without manual Firestore edits.
 */
export async function updateSchoolTestingPeriod(
  schoolId: string,
  testingExpiresAt: string,
): Promise<RefreshSubscriptionResult> {
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
    active: true,
    updatedAt: serverTimestamp(),
    ...clearSubscriptionDeactivationFields(),
  });
  const result = await syncPlatformSubscription(schoolId);
  if (!result.entitled) {
    throw new Error(
      "Testing date saved, but the school is still not entitled. Check usage expiry or sync IAM on the school project.",
    );
  }
  return result;
}

/**
 * Updates paid usage end date, reactivates the school, and syncs
 * platform/subscription on the school Firebase project.
 */
export async function updateSchoolUsagePeriod(
  schoolId: string,
  usageExpiresAt: string,
): Promise<RefreshSubscriptionResult> {
  const trimmed = usageExpiresAt.trim();
  if (trimmed && !validateUsageExpiryDate(trimmed)) {
    throw new Error("Usage expiry date must be YYYY-MM-DD.");
  }

  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    usageExpiresAt: trimmed || null,
    ...(trimmed
      ? { active: true, ...clearSubscriptionDeactivationFields() }
      : {}),
    updatedAt: serverTimestamp(),
  });
  const result = await syncPlatformSubscription(schoolId);
  if (trimmed && !result.entitled) {
    throw new Error(
      "Usage date saved, but the school is still not entitled. Check testing expiry or sync IAM on the school project.",
    );
  }
  return result;
}

/** Re-push registry entitlement into school platform/subscription. */
export async function syncSchoolPlatformSubscription(
  schoolId: string,
): Promise<RefreshSubscriptionResult> {
  return syncPlatformSubscription(schoolId);
}

export async function updateSchoolLogoUrl(
  schoolId: string,
  logoUrl: string | null,
): Promise<void> {
  const trimmed = logoUrl?.trim() ?? "";
  if (trimmed && !/^https?:\/\//i.test(trimmed)) {
    throw new Error("School logo URL must start with http:// or https://.");
  }

  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    logoUrl: trimmed || null,
    updatedAt: serverTimestamp(),
  });
}

