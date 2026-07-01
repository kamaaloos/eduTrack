import type { SchoolTermRecord } from "../types/schoolTerm";
import { defaultSchoolTermLabel } from "./academicYear";

export function resolveSchoolTerm(
  record: SchoolTermRecord | null | undefined,
): SchoolTermRecord {
  if (record?.status === "active" || record?.status === "between") {
    return record;
  }

  const now = new Date().toISOString();
  return {
    status: "active",
    label: defaultSchoolTermLabel(),
    startedAt: now,
    startedBy: "legacy",
  };
}
