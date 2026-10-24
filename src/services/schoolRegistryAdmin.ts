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
import { getUsageRemainingDays } from "../utils/usageExpiry";
import { validateUsageExpiryDate } from "../utils/validation";

/** Registry date was written; school platform/subscription sync failed afterward. */
export class PeriodSyncError extends Error {
  readonly registrySaved: true = true;
  readonly savedDate: string | null;

  constructor(message: string, savedDate: string | null) {
    super(message);
    this.name = "PeriodSyncError";
    this.savedDate = savedDate;
  }
}

function formatPlatformSyncFailure(raw: string | undefined): string {
  const detail = (raw || "").trim();
  const lower = detail.toLowerCase();
  if (!detail || detail === "missing_project_id") {
    return (
      "Date was saved in the registry, but the school has no firebase.projectId — " +
      "fix the school Firebase config, then tap Sync access."
    );
  }
  if (
    lower.includes("permission") ||
    lower.includes("permission_denied") ||
    lower.includes("7 ") ||
    lower.includes("iam")
  ) {
    return (
      "Date was saved in the registry, but syncing platform/subscription to the school " +
      "Firebase project failed (permission denied). Grant the registry Cloud Functions " +
      "service account Cloud Datastore User on that school project, then tap Sync access."
    );
  }
  return (
    `Date was saved in the registry, but platform sync failed: ${detail}. ` +
    "Deploy registry Cloud Functions and check school-project IAM, then tap Sync access."
  );
}

/** Pushes registry entitlement into school platform/subscription (Admin SDK via CF). */
async function syncPlatformSubscription(
  schoolId: string,
): Promise<RefreshSubscriptionResult> {
  let result = await refreshSchoolSubscriptionSync(schoolId);
  // One retry — callable can briefly read the pre-update registry snapshot.
  if (result.ok && !result.entitled) {
    result = await refreshSchoolSubscriptionSync(schoolId);
  }
  return result;
}

async function requireSyncedEntitlement(
  schoolId: string,
  savedDate: string,
  pastDateMessage: string,
  notEntitledMessage: string,
): Promise<RefreshSubscriptionResult> {
  const result = await syncPlatformSubscription(schoolId);
  if (!result.ok) {
    throw new PeriodSyncError(formatPlatformSyncFailure(result.error), savedDate);
  }
  if (!result.entitled) {
    const days = getUsageRemainingDays(savedDate);
    if (days != null && days < 0) {
      throw new PeriodSyncError(pastDateMessage, savedDate);
    }
    throw new PeriodSyncError(notEntitledMessage, savedDate);
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
  const testingDays = getUsageRemainingDays(trimmed);
  if (testingDays != null && testingDays < 0) {
    throw new Error("Testing end date must be today or in the future.");
  }

  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    testingExpiresAt: trimmed,
    active: true,
    updatedAt: serverTimestamp(),
    ...clearSubscriptionDeactivationFields(),
  });
  return requireSyncedEntitlement(
    schoolId,
    trimmed,
    "Testing date was saved, but it is in the past so access stays blocked. Choose today or a future date.",
    "Testing date was saved, but the school is still not entitled. If a past usage end date is set, extend or clear usage, then tap Sync access.",
  );
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
  if (trimmed) {
    const usageDays = getUsageRemainingDays(trimmed);
    if (usageDays != null && usageDays < 0) {
      throw new Error("Usage end date must be today or in the future.");
    }
  }

  const db = requireRegistryDb();
  await updateDoc(doc(db, COLLECTION, schoolId), {
    usageExpiresAt: trimmed || null,
    ...(trimmed
      ? { active: true, ...clearSubscriptionDeactivationFields() }
      : {}),
    updatedAt: serverTimestamp(),
  });
  if (!trimmed) {
    const cleared = await syncPlatformSubscription(schoolId);
    if (!cleared.ok) {
      throw new PeriodSyncError(formatPlatformSyncFailure(cleared.error), null);
    }
    return cleared;
  }
  return requireSyncedEntitlement(
    schoolId,
    trimmed,
    "Usage date was saved, but it is in the past so access stays blocked. Choose today or a future date.",
    "Usage date was saved, but the school is still not entitled. Tap Sync access, or check school Firebase IAM for the registry service account.",
  );
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

