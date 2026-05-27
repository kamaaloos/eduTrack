import type { SchoolRecord, StoredSchool } from "../types/school";

export type SchoolRegistrySnapshot = Pick<
  SchoolRecord,
  "id" | "name" | "usageExpiresAt"
>;

/** Merge cached school selection with fresh registry metadata. */
export function applyRegistryToStoredSchool(
  stored: StoredSchool,
  fresh: SchoolRegistrySnapshot | null,
): StoredSchool {
  if (!fresh) return stored;
  return {
    ...stored,
    name: fresh.name,
    usageExpiresAt: fresh.usageExpiresAt ?? null,
  };
}

export function storedSchoolNeedsPersist(
  before: StoredSchool,
  after: StoredSchool,
): boolean {
  return (
    (after.usageExpiresAt ?? null) !== (before.usageExpiresAt ?? null) ||
    after.name !== before.name
  );
}

export function toStoredSchool(school: SchoolRecord): StoredSchool {
  return {
    id: school.id,
    name: school.name,
    firebase: school.firebase,
    usageExpiresAt: school.usageExpiresAt ?? null,
  };
}
