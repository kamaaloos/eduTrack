import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useSchoolContext } from "../src/context/schoolContext";
import { buildStudentAttendanceQuery } from "../src/services/attendanceQueries";
import { db } from "../src/services/firebase";
import {
  isIgnorableFirestoreListenerError,
  onFirestoreClosing,
} from "../src/services/firestoreSession";
import { getExamResultsForStudent } from "../src/services/examResults";
import {
  filterSchedulesForDay,
  getTodayDayKey,
  type ScheduleSlot,
} from "../src/utils/scheduleFormat";

export function useStudentDashboardData(
  studentId: string | undefined,
  profileClassId?: string | null,
) {
  const { selectedSchool } = useSchoolContext();
  const schoolKey = selectedSchool?.id ?? null;

  const [classId, setClassId] = useState<string | null>(profileClassId ?? null);
  const [messages, setMessages] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [gradedExamIds, setGradedExamIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!studentId || !db || !schoolKey) {
      setClassId(null);
      return;
    }

    if (profileClassId) {
      setClassId(profileClassId);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const linkSnap = await getDocs(
          query(
            collection(db, "studentClasses"),
            where("studentId", "==", studentId),
          ),
        );
        if (cancelled) return;
        const fromLink = linkSnap.docs[0]?.data()?.classId as string | undefined;
        setClassId(fromLink || null);
      } catch {
        if (!cancelled) setClassId(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [studentId, profileClassId, schoolKey]);

  useEffect(() => {
    if (!studentId || !classId || !db || !schoolKey) {
      setMessages([]);
      setHomework([]);
      setRemarks([]);
      setSchedule([]);
      setExams([]);
      return;
    }

    const unsubs: Array<() => void> = [];

    const onError = (label: string) => (err: Error) => {
      if (isIgnorableFirestoreListenerError(err)) return;
      console.error(`Dashboard ${label} listener:`, err);
    };

    const mapDocs = (snapshot: { docs: { id: string; data: () => object }[] }) =>
      snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

    const stopAll = () => {
      while (unsubs.length > 0) {
        const unsub = unsubs.pop();
        try {
          unsub?.();
        } catch {
          // Listener may already be removed during Firestore shutdown.
        }
      }
    };

    unsubs.push(
      onSnapshot(
        collection(db, "classes", classId, "announcements"),
        (s) => setMessages(mapDocs(s)),
        onError("announcements"),
      ),
    );
    unsubs.push(
      onSnapshot(
        collection(db, "classes", classId, "homework"),
        (s) => setHomework(mapDocs(s)),
        onError("homework"),
      ),
    );
    unsubs.push(
      onSnapshot(
        query(
          collection(db, "classes", classId, "remarks"),
          where("studentId", "==", studentId),
        ),
        (s) => setRemarks(mapDocs(s)),
        onError("remarks"),
      ),
    );
    unsubs.push(
      onSnapshot(
        collection(db, "classes", classId, "schedules"),
        (s) => {
          const all = mapDocs(s) as ScheduleSlot[];
          setSchedule(filterSchedulesForDay(all, getTodayDayKey()));
        },
        onError("schedules"),
      ),
    );
    unsubs.push(
      onSnapshot(
        collection(db, "classes", classId, "exams"),
        (s) => setExams(mapDocs(s)),
        onError("exams"),
      ),
    );

    const removeClosingHandler = onFirestoreClosing(stopAll);

    return () => {
      removeClosingHandler();
      stopAll();
    };
  }, [studentId, classId, schoolKey]);

  useEffect(() => {
    if (!studentId || !db || !schoolKey) {
      setAttendance([]);
      return;
    }

    const unsubs: Array<() => void> = [];
    const stopAll = () => {
      while (unsubs.length > 0) {
        const unsub = unsubs.pop();
        try {
          unsub?.();
        } catch {
          // Ignore during shutdown.
        }
      }
    };

    unsubs.push(
      onSnapshot(
        buildStudentAttendanceQuery(studentId),
        (snapshot) => {
          setAttendance(
            snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
          );
        },
        (err) => {
          if (isIgnorableFirestoreListenerError(err)) return;
          console.error("Dashboard attendance listener:", err);
        },
      ),
    );

    const removeClosingHandler = onFirestoreClosing(stopAll);

    return () => {
      removeClosingHandler();
      stopAll();
    };
  }, [studentId, schoolKey]);

  useEffect(() => {
    if (!studentId || exams.length === 0) {
      setGradedExamIds(new Set());
      return;
    }

    let cancelled = false;
    const examIds = exams.map((e) => String(e.id)).filter(Boolean);

    void getExamResultsForStudent(studentId, { examIds }).then((results) => {
      if (cancelled) return;
      const graded = new Set(
        results.filter((r) => r.graded).map((r) => r.examId),
      );
      setGradedExamIds(graded);
    });

    return () => {
      cancelled = true;
    };
  }, [studentId, exams]);

  const remarksAndAttendance = useMemo(() => {
    const toSortTime = (value: unknown): number => {
      if (!value) return 0;
      if (typeof value === "object" && value !== null && "toDate" in value) {
        return (value as { toDate: () => Date }).toDate().getTime();
      }
      if (typeof value === "object" && value !== null && "seconds" in value) {
        return (value as { seconds: number }).seconds * 1000;
      }
      const parsed = new Date(String(value)).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const remarkItems = remarks.map((item) => ({
      ...item,
      feedType: "remark" as const,
      sortAt: toSortTime(item.createdAt),
    }));

    const attendanceItems = attendance.map((item) => ({
      ...item,
      feedType: "attendance" as const,
      sortAt: toSortTime(item.date),
    }));

    return [...remarkItems, ...attendanceItems].sort(
      (a, b) => b.sortAt - a.sortAt,
    );
  }, [remarks, attendance]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return {
    classId,
    messages,
    homework,
    exams,
    schedule,
    remarksAndAttendance,
    gradedExamIds,
    refreshing,
    onRefresh,
  };
}
