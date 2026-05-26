import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getAttendanceHistorySinceDate } from "../constants/attendanceHistory";
import { hasParentAttendanceResponse } from "./parentAttendanceResponse";
import { db } from "./firebase";
import {
  getTeacherClassIds,
  loadStudentsForTeacher,
  type TeacherStudent,
} from "./teacherStudents";

export type TeacherAbsenceReport = {
  id: string;
  studentId: string;
  studentName: string;
  classId: string | null;
  reason: string;
  reasonCode?: string;
  notes?: string | null;
  createdAt: Date | null;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date((value as { seconds: number }).seconds * 1000);
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function queryAbsenceByStudentIds(
  studentIds: string[],
): Promise<TeacherAbsenceReport[]> {
  if (!db || studentIds.length === 0) return [];

  const reports: TeacherAbsenceReport[] = [];
  const chunkSize = 10;

  for (let i = 0; i < studentIds.length; i += chunkSize) {
    const chunk = studentIds.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;

    try {
      const snap = await getDocs(
        query(
          collection(db, "parentRemarks"),
          where("type", "==", "absence"),
          where("studentId", "in", chunk),
        ),
      );

      snap.docs.forEach((d) => {
        const data = d.data();
        reports.push({
          id: d.id,
          studentId: String(data.studentId ?? ""),
          studentName: "",
          classId: (data.classId as string) || null,
          reason: String(data.reason ?? "Absence"),
          reasonCode: data.reasonCode as string | undefined,
          notes: (data.notes as string) || null,
          createdAt: toDate(data.createdAt),
        });
      });
    } catch (err) {
      console.warn("parentRemarks query failed for chunk", err);
    }
  }

  return reports;
}

/** Parent replies to teacher-marked absence (stored on attendance.parentResponse). */
async function queryAttendanceParentResponses(
  studentIds: string[],
  filterClassId?: string,
): Promise<TeacherAbsenceReport[]> {
  if (!db || studentIds.length === 0) return [];

  const sinceDate = getAttendanceHistorySinceDate();
  const reports: TeacherAbsenceReport[] = [];
  const chunkSize = 10;

  for (let i = 0; i < studentIds.length; i += chunkSize) {
    const chunk = studentIds.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;

    try {
      const snap = await getDocs(
        query(
          collection(db, "attendance"),
          where("studentId", "in", chunk),
          where("date", ">=", sinceDate),
        ),
      );

      snap.docs.forEach((d) => {
        const data = d.data();
        const record = { id: d.id, ...data };
        if (data.status !== "absent" || !hasParentAttendanceResponse(record)) {
          return;
        }

        const classId = (data.classId as string) || null;
        if (filterClassId && classId !== filterClassId) return;

        const pr = data.parentResponse as {
          reason?: string;
          reasonCode?: string;
          notes?: string | null;
          respondedAt?: unknown;
        };

        reports.push({
          id: `att_${d.id}`,
          studentId: String(data.studentId ?? ""),
          studentName: "",
          classId,
          reason: String(pr?.reason ?? "Absence"),
          reasonCode: pr?.reasonCode,
          notes: pr?.notes ?? null,
          createdAt: toDate(pr?.respondedAt),
        });
      });
    } catch (err) {
      console.warn("attendance parentResponse query failed for chunk", err);
    }
  }

  return reports;
}

function attachStudentNames(
  reports: TeacherAbsenceReport[],
  students: TeacherStudent[],
): TeacherAbsenceReport[] {
  const byId = new Map(
    students.map((s) => [
      s.id,
      s.name || s.email || `Student ${s.id.slice(0, 6)}`,
    ]),
  );

  return reports.map((r) => ({
    ...r,
    studentName: byId.get(r.studentId) || "Student",
    classId: r.classId || students.find((s) => s.id === r.studentId)?.classId || null,
  }));
}

/** Loads parent-submitted absence reports for students in the teacher's classes. */
export async function loadAbsenceReportsForTeacher(
  teacherId: string,
  filterClassId?: string,
): Promise<TeacherAbsenceReport[]> {
  if (!db) return [];

  const classIds = await getTeacherClassIds(teacherId);
  if (classIds.length === 0) return [];

  const scopedClassIds = filterClassId
    ? classIds.includes(filterClassId)
      ? [filterClassId]
      : []
    : classIds;

  if (scopedClassIds.length === 0) return [];

  const { students } = await loadStudentsForTeacher(teacherId);
  const scopedStudents = filterClassId
    ? students.filter((s) => s.classId === filterClassId)
    : students;

  const studentIds = scopedStudents.map((s) => s.id);

  const [byRemarks, byAttendanceResponses] = await Promise.all([
    queryAbsenceByStudentIds(studentIds),
    queryAttendanceParentResponses(studentIds, filterClassId),
  ]);

  const byId = new Map<string, TeacherAbsenceReport>();
  for (const r of [...byRemarks, ...byAttendanceResponses]) {
    if (!r.studentId || !studentIds.includes(r.studentId)) continue;
    byId.set(r.id, r);
  }

  const merged = attachStudentNames([...byId.values()], scopedStudents);
  merged.sort((a, b) => {
    const ta = a.createdAt?.getTime() ?? 0;
    const tb = b.createdAt?.getTime() ?? 0;
    return tb - ta;
  });

  return merged;
}
