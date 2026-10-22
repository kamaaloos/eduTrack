import {
  collection,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { getAttendanceHistorySinceDate } from "../constants/attendanceHistory";
import { hasParentAttendanceResponse } from "./parentAttendanceResponse";

export type TeacherAttendanceRecord = {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: string;
  markedAt?: number;
  parentResponse?: {
    reason?: string;
    reasonCode?: string;
    notes?: string | null;
    respondedAt?: unknown;
  };
};

export function subscribeClassAttendance(
  classId: string,
  date: string,
  onData: (records: TeacherAttendanceRecord[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, "attendance"),
    where("classId", "==", classId),
    where("date", "==", date),
  );

  return onSnapshot(
    q,
    (snap) => {
      const byStudent = new Map<string, TeacherAttendanceRecord>();

      snap.docs.forEach((d) => {
        const data = d.data();
        const studentId = String(data.studentId ?? "");
        if (!studentId) return;

        const record: TeacherAttendanceRecord = {
          id: d.id,
          studentId,
          classId: String(data.classId ?? classId),
          date: String(data.date ?? date),
          status: String(data.status ?? ""),
          markedAt: Number(data.markedAt ?? 0) || 0,
          parentResponse: data.parentResponse as
            | TeacherAttendanceRecord["parentResponse"]
            | undefined,
        };

        const prev = byStudent.get(studentId);
        if (!prev) {
          byStudent.set(studentId, record);
          return;
        }

        const prevAt = prev.markedAt ?? 0;
        const nextAt = record.markedAt ?? 0;
        if (nextAt > prevAt) {
          byStudent.set(studentId, record);
          return;
        }
        if (nextAt < prevAt) return;

        const prevExcused = hasParentAttendanceResponse(prev);
        const nextExcused = hasParentAttendanceResponse(record);
        if (nextExcused && !prevExcused) {
          byStudent.set(studentId, record);
        }
      });

      onData([...byStudent.values()]);
    },
    (err) => {
      onError?.(err);
      onData([]);
    },
  );
}

export function subscribeClassAbsentRecords(
  classId: string,
  onData: (records: TeacherAttendanceRecord[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const sinceDate = getAttendanceHistorySinceDate();
  const q = query(
    collection(db, "attendance"),
    where("classId", "==", classId),
    where("status", "==", "absent"),
    where("date", ">=", sinceDate),
  );

  return onSnapshot(
    q,
    (snap) => {
      const records = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            studentId: String(data.studentId ?? ""),
            classId: String(data.classId ?? classId),
            date: String(data.date ?? ""),
            status: "absent",
            parentResponse: data.parentResponse as
              | TeacherAttendanceRecord["parentResponse"]
              | undefined,
          } satisfies TeacherAttendanceRecord;
        })
        .sort((a, b) => b.date.localeCompare(a.date));

      onData(records);
    },
    (err) => {
      onError?.(err);
      onData([]);
    },
  );
}
