import {
  collection,
  getCountFromServer,
  getDocs,
  query,
  where,
  type Firestore,
} from "firebase/firestore";
import { getAttendanceHistorySinceDate } from "../constants/attendanceHistory";
import { db } from "./firebase";

export type AttendanceRecord = {
  id: string;
  studentId?: string;
  classId?: string;
  date?: string;
  status?: string;
  parentResponse?: unknown;
  remark?: string;
  [key: string]: unknown;
};

export type AttendanceSummary = {
  total: number;
  present: number;
  rate: number | null;
  sinceDate: string;
};

/** Firestore query for one student's attendance within the history window. */
export function buildStudentAttendanceQuery(studentId: string) {
  const sinceDate = getAttendanceHistorySinceDate();
  return query(
    collection(db!, "attendance"),
    where("studentId", "==", studentId),
    where("date", ">=", sinceDate),
  );
}

/** Firestore query for class attendance within the history window. */
export function buildClassAttendanceSinceQuery(classId: string) {
  const sinceDate = getAttendanceHistorySinceDate();
  return query(
    collection(db!, "attendance"),
    where("classId", "==", classId),
    where("date", ">=", sinceDate),
  );
}

export async function fetchStudentAttendanceHistory(
  studentId: string,
): Promise<AttendanceRecord[]> {
  if (!db || !studentId) return [];

  try {
    const snap = await getDocs(buildStudentAttendanceQuery(studentId));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as AttendanceRecord)
      .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
  } catch (err) {
    console.warn("fetchStudentAttendanceHistory:", err);
    return [];
  }
}

export function summarizeAttendanceRecords(
  records: { status?: string }[],
): AttendanceSummary {
  const sinceDate = getAttendanceHistorySinceDate();
  const present = records.filter((r) => r.status === "present").length;
  const total = records.length;
  return {
    total,
    present,
    rate: total > 0 ? Math.round((present / total) * 100) : null,
    sinceDate,
  };
}

/** Admin-scoped attendance counts for the history window (2 count reads). */
export async function countAdminAttendanceSummary(
  firestore: Firestore | null = db,
): Promise<AttendanceSummary> {
  const sinceDate = getAttendanceHistorySinceDate();

  if (!firestore) {
    return { total: 0, present: 0, rate: null, sinceDate };
  }

  try {
    const [totalSnap, presentSnap] = await Promise.all([
      getCountFromServer(
        query(
          collection(firestore, "attendance"),
          where("date", ">=", sinceDate),
        ),
      ),
      getCountFromServer(
        query(
          collection(firestore, "attendance"),
          where("status", "==", "present"),
          where("date", ">=", sinceDate),
        ),
      ),
    ]);

    const total = totalSnap.data().count;
    const present = presentSnap.data().count;

    return {
      total,
      present,
      rate: total > 0 ? Math.round((present / total) * 100) : null,
      sinceDate,
    };
  } catch (err) {
    console.warn("countAdminAttendanceSummary:", err);
    return { total: 0, present: 0, rate: null, sinceDate };
  }
}
