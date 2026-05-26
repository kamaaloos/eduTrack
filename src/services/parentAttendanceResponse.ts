import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { absenceReasonLabel } from "../constants/absenceReasons";
import { notifyTeachersParentAttendanceResponse } from "./notificationEvents";
import { db } from "./firebase";

export type AttendanceParentResponse = {
  parentId: string;
  reasonCode: string;
  reason: string;
  notes: string | null;
  respondedAt: unknown;
};

async function resolveStudentName(studentId: string): Promise<string> {
  const snap = await getDoc(doc(db, "users", studentId));
  const data = snap.data();
  return (data?.name as string) || (data?.email as string) || "Student";
}

export async function submitParentAttendanceResponse(params: {
  attendanceId: string;
  parentId: string;
  studentId?: string;
  studentName?: string;
  classId?: string;
  reasonCode: string;
  notes?: string;
}): Promise<void> {
  const { attendanceId, parentId, reasonCode, notes } = params;
  const ref = doc(db, "attendance", attendanceId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Attendance record not found");
  }

  const data = snap.data();
  if (data.status !== "absent") {
    throw new Error("Only absent attendance can be explained");
  }
  if (data.parentResponse) {
    throw new Error("A reason was already submitted for this absence");
  }

  const reason = absenceReasonLabel(reasonCode);

  await updateDoc(ref, {
    parentResponse: {
      parentId,
      reasonCode,
      reason,
      notes: notes?.trim() || null,
      respondedAt: serverTimestamp(),
    },
  });

  const classId = (params.classId || data.classId) as string | undefined;
  const studentId = (params.studentId || data.studentId) as string | undefined;

  if (classId && studentId) {
    const studentName =
      params.studentName?.trim() || (await resolveStudentName(studentId));
    void notifyTeachersParentAttendanceResponse({
      classId,
      studentId,
      studentName,
      reason,
      parentId,
    });
  }
}

export function hasParentAttendanceResponse(
  record: { parentResponse?: AttendanceParentResponse | null },
): boolean {
  return Boolean(
    record.parentResponse &&
      typeof record.parentResponse === "object" &&
      record.parentResponse.reasonCode,
  );
}
