import { useFocusEffect } from "@react-navigation/native";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import type { TodayMap, StudentRow } from "../components/teachers/attendance/teacherAttendanceTypes";
import { AuthContext } from "../src/context/authContext";
import { notifyAttendanceMarked } from "../src/services/notificationEvents";
import { db } from "../src/services/firebase";
import { hasParentAttendanceResponse } from "../src/services/parentAttendanceResponse";
import {
  subscribeClassAbsentRecords,
  subscribeClassAttendance,
  type TeacherAttendanceRecord,
} from "../src/services/teacherAttendanceResponses";
import { loadStudentsForTeacher } from "../src/services/teacherStudents";

export function useTeacherAttendance() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classId, setClassId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [todayByStudent, setTodayByStudent] = useState<TodayMap>({});
  const [recentAbsents, setRecentAbsents] = useState<TeacherAttendanceRecord[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const studentNameById = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((s) => {
      map.set(s.id, s.name || s.email || t("common.student"));
    });
    return map;
  }, [students, t]);

  const sortedStudents = useMemo(
    () =>
      [...students].sort((a, b) =>
        (a.name || a.email || a.id).localeCompare(b.name || b.email || b.id),
      ),
    [students],
  );

  const filteredPickerStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return sortedStudents;
    return sortedStudents.filter((s) => {
      const label = (s.name || s.email || s.id).toLowerCase();
      return label.includes(q);
    });
  }, [sortedStudents, studentSearch]);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );

  const selectedIndex = sortedStudents.findIndex(
    (s) => s.id === selectedStudentId,
  );

  useEffect(() => {
    if (!user?.uid) return;

    const loadClasses = async () => {
      const teacherSnap = await getDocs(
        query(
          collection(db, "teacherClasses"),
          where("teacherId", "==", user.uid),
        ),
      );

      const classIds = teacherSnap.docs
        .map((d) => d.data().classId as string)
        .filter(Boolean);

      if (classIds.length === 0) {
        setClasses([]);
        setClassId("");
        return;
      }

      const classData = await Promise.all(
        classIds.map(async (id) => {
          const classSnap = await getDoc(doc(db, "classes", id));
          if (!classSnap.exists()) return null;
          return { id: classSnap.id, ...classSnap.data() };
        }),
      );

      setClasses(classData.filter(Boolean));
    };

    void loadClasses();
  }, [user]);

  useEffect(() => {
    setSelectedStudentId("");
    setStudentSearch("");
    setPickerOpen(false);

    if (!user?.uid || !classId) {
      setStudents([]);
      return;
    }

    const loadStudents = async () => {
      const { students: allStudents } = await loadStudentsForTeacher(user.uid);
      const inClass = allStudents.filter((s) => s.classId === classId);
      setStudents(inClass);
      if (inClass.length > 0) {
        const first = [...inClass].sort((a, b) =>
          (a.name || a.email || a.id).localeCompare(
            b.name || b.email || b.id,
          ),
        )[0];
        setSelectedStudentId(first.id);
      }
    };

    void loadStudents();
  }, [user, classId]);

  useEffect(() => {
    if (!classId) {
      setTodayByStudent({});
      setRecentAbsents([]);
      return;
    }

    const unsubToday = subscribeClassAttendance(
      classId,
      today,
      (records) => {
        const map: TodayMap = {};
        records.forEach((r) => {
          map[r.studentId] = r;
        });
        setTodayByStudent(map);
      },
      (err) => console.warn("Today attendance listener:", err),
    );

    const unsubAbsents = subscribeClassAbsentRecords(
      classId,
      setRecentAbsents,
      (err) => console.warn("Absent records listener:", err),
    );

    return () => {
      unsubToday();
      unsubAbsents();
    };
  }, [classId, today]);

  const pendingToday = useMemo(
    () =>
      Object.values(todayByStudent).filter(
        (r) => r.status === "absent" && !hasParentAttendanceResponse(r),
      ),
    [todayByStudent],
  );

  const excusedToday = useMemo(
    () =>
      Object.values(todayByStudent).filter(
        (r) => r.status === "absent" && hasParentAttendanceResponse(r),
      ),
    [todayByStudent],
  );

  const markAttendance = async (
    studentId: string,
    status: "present" | "absent" | "late",
  ) => {
    if (!classId) {
      Alert.alert(t("teacher.attendance.selectClass"));
      return;
    }

    const studentName =
      studentNameById.get(studentId) ||
      students.find((s) => s.id === studentId)?.name ||
      t("common.student");

    try {
      await addDoc(collection(db, "attendance"), {
        studentId,
        classId,
        date: today,
        status,
        markedBy: user?.uid,
      });
      Alert.alert(t("common.success"), t("teacher.attendance.saved"));

      if (status === "absent" || status === "late") {
        void notifyAttendanceMarked({
          classId,
          studentId,
          studentName,
          status,
          date: today,
          actorId: user?.uid ?? null,
        });
      }
    } catch (error) {
      console.log(error);
      Alert.alert(t("common.error"), t("teacher.attendance.saveError"));
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh]),
  );

  const selectStudent = (id: string) => {
    setSelectedStudentId(id);
    setPickerOpen(false);
    setStudentSearch("");
  };

  const goPrevStudent = () => {
    if (sortedStudents.length === 0) return;
    const idx = selectedIndex <= 0 ? sortedStudents.length - 1 : selectedIndex - 1;
    setSelectedStudentId(sortedStudents[idx].id);
  };

  const goNextStudent = () => {
    if (sortedStudents.length === 0) return;
    const idx =
      selectedIndex < 0 || selectedIndex >= sortedStudents.length - 1
        ? 0
        : selectedIndex + 1;
    setSelectedStudentId(sortedStudents[idx].id);
  };

  return {
    classes,
    classId,
    setClassId,
    students,
    selectedStudent,
    selectedStudentId,
    selectedIndex,
    sortedStudents,
    filteredPickerStudents,
    pickerOpen,
    setPickerOpen,
    studentSearch,
    setStudentSearch,
    todayByStudent,
    recentAbsents,
    pendingToday,
    excusedToday,
    studentNameById,
    refreshing,
    onRefresh,
    markAttendance,
    selectStudent,
    goPrevStudent,
    goNextStudent,
  };
}
