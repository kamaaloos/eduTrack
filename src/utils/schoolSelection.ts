import type { SchoolRecord, StoredSchool } from "../types/school";

export type SchoolRegistrySnapshot = Pick<
  SchoolRecord,
  "id" | "name" | "testingExpiresAt" | "usageExpiresAt" | "logoUrl" | "theme"
>;

function themeSnapshotKey(theme: StoredSchool["theme"]): string {
  if (!theme) return "";
  return JSON.stringify({
    primaryColor: theme.primaryColor ?? "",
    accentColor: theme.accentColor ?? "",
    backgroundColor: theme.backgroundColor ?? "",
    fontKey: theme.fontKey ?? "",
  });
}

/** Merge cached school selection with fresh registry metadata. */
export function applyRegistryToStoredSchool(
  stored: StoredSchool,
  fresh: SchoolRegistrySnapshot | null,
): StoredSchool {
  if (!fresh) return stored;
  return {
    ...stored,
    name: fresh.name,
    testingExpiresAt: fresh.testingExpiresAt ?? null,
    usageExpiresAt: fresh.usageExpiresAt ?? null,
    logoUrl: fresh.logoUrl ?? stored.logoUrl ?? null,
    theme: fresh.theme ?? stored.theme ?? null,
  };
}

export function storedSchoolNeedsPersist(
  before: StoredSchool,
  after: StoredSchool,
): boolean {
  return (
    (after.testingExpiresAt ?? null) !== (before.testingExpiresAt ?? null) ||
    (after.usageExpiresAt ?? null) !== (before.usageExpiresAt ?? null) ||
    after.name !== before.name ||
    (after.logoUrl ?? null) !== (before.logoUrl ?? null) ||
    themeSnapshotKey(after.theme) !== themeSnapshotKey(before.theme)
  );
}

export function toStoredSchool(school: SchoolRecord): StoredSchool {
  return {
    id: school.id,
    name: school.name,
    firebase: school.firebase,
    testingExpiresAt: school.testingExpiresAt ?? null,
    usageExpiresAt: school.usageExpiresAt ?? null,
    logoUrl: school.logoUrl ?? null,
    theme: school.theme ?? null,
  };
}
