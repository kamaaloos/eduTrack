import { hasParentAttendanceResponse } from "../../../src/services/parentAttendanceResponse";
import type { TeacherAttendanceRecord } from "../../../src/services/teacherAttendanceResponses";

export type AttendanceMarkStatus = "present" | "late" | "absent" | "excused";

export const ATTENDANCE_MARK_COLUMNS: AttendanceMarkStatus[] = [
  "present",
  "late",
  "absent",
  "excused",
];

/** Map today's record to the roster column selection. */
export function resolveAttendanceColumn(
  record?: TeacherAttendanceRecord | null,
): AttendanceMarkStatus | null {
  if (!record?.status) return null;
  if (record.status === "present") return "present";
  if (record.status === "late") return "late";
  if (record.status === "excused") return "excused";
  if (record.status === "absent") {
    return hasParentAttendanceResponse(record) ? "excused" : "absent";
  }
  return null;
}
