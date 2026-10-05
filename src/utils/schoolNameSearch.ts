import type { SchoolRecord } from "../types/school";

/** Normalize school names for case-insensitive matching. */
export function normalizeSchoolNameQuery(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Autocomplete matches by school name only.
 * Prefers names that start with the query, then names that contain it.
 */
export function filterSchoolsByNameQuery(
  schools: SchoolRecord[],
  query: string,
  limit = 8,
): SchoolRecord[] {
  const normalized = normalizeSchoolNameQuery(query);
  if (!normalized) return [];

  const startsWith: SchoolRecord[] = [];
  const contains: SchoolRecord[] = [];

  for (const school of schools) {
    const name = normalizeSchoolNameQuery(school.name);
    if (!name) continue;
    if (name.startsWith(normalized)) {
      startsWith.push(school);
    } else if (name.includes(normalized)) {
      contains.push(school);
    }
  }

  const byName = (a: SchoolRecord, b: SchoolRecord) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

  startsWith.sort(byName);
  contains.sort(byName);

  return [...startsWith, ...contains].slice(0, limit);
}
