import { useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../src/services/firebase";
import { hasParentAttendanceResponse } from "../src/services/parentAttendanceResponse";
import { useSchoolContext } from "../src/context/schoolContext";
import { useFirestoreListenerEffect } from "./useFirestoreListenerEffect";

/** Live count of today's absents still waiting for a parent explanation. */
export function useTeacherPendingAbsenceCount(
  teacherId: string | null,
  classIds: string[],
): number {
  const { selectedSchool } = useSchoolContext();
  const schoolKey = selectedSchool?.id ?? null;
  const [count, setCount] = useState(0);
  const today = new Date().toISOString().split("T")[0];
  const classKey = classIds.join(",");

  useFirestoreListenerEffect(() => {
    if (!teacherId || !db || !schoolKey || classIds.length === 0) {
      setCount(0);
      return;
    }

    const pendingByClass = new Map<string, number>();

    const recompute = () => {
      let total = 0;
      pendingByClass.forEach((n) => {
        total += n;
      });
      setCount(total);
    };

    return classIds.map((classId) =>
      onSnapshot(
        query(
          collection(db, "attendance"),
          where("classId", "==", classId),
          where("date", "==", today),
        ),
        (snap) => {
          const seenStudents = new Set<string>();
          let pending = 0;

          snap.docs.forEach((d) => {
            const data = d.data();
            if (data.status !== "absent") return;
            const studentId = data.studentId as string | undefined;
            if (!studentId || seenStudents.has(studentId)) return;

            const record = { parentResponse: data.parentResponse };
            if (!hasParentAttendanceResponse(record)) {
              seenStudents.add(studentId);
              pending += 1;
            }
          });

          pendingByClass.set(classId, pending);
          recompute();
        },
        () => {
          pendingByClass.set(classId, 0);
          recompute();
        },
      ),
    );
  }, [teacherId, classKey, today, schoolKey]);

  return count;
}
