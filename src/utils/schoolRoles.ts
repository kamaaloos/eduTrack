export const SCHOOL_ROLES = ["student", "teacher", "parent", "admin"] as const;

export type SchoolRole = (typeof SCHOOL_ROLES)[number];

export function isSchoolRole(value: unknown): value is SchoolRole {
  return (
    typeof value === "string" &&
    (SCHOOL_ROLES as readonly string[]).includes(value)
  );
}
