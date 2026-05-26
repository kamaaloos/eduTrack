import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../src/context/authContext";
import { useSchoolContext } from "../src/context/schoolContext";
import { db } from "../src/services/firebase";
import { isIgnorableFirestoreListenerError } from "../src/services/firestoreSession";
import { loadAnnouncementsForTeacher } from "../src/services/teacherAnnouncements";
import { loadStudentsForTeacher } from "../src/services/teacherStudents";
import { useFirestoreListenerEffect } from "./useFirestoreListenerEffect";

export function useTeacherDashboardData() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { selectedSchool } = useSchoolContext();
  const schoolKey = selectedSchool?.id ?? null;

  const [classes, setClasses] = useState<any[]>([]);
  const [classIds, setClassIds] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const reloadDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFirestoreListenerEffect(() => {
    if (!user?.uid || !db || !schoolKey) return;

    const classQuery = query(
      collection(db, "teacherClasses"),
      where("teacherId", "==", user.uid),
    );

    return onSnapshot(classQuery, async (snapshot) => {
      const teacherRelations = snapshot.docs.map((d) => d.data());
      const ids = teacherRelations
        .map((item: any) => item.classId)
        .filter(Boolean);
      setClassIds(ids);

      const classPromises = ids.map(async (id: string) => {
        const classSnap = await getDoc(doc(db, "classes", id));
        return {
          id: classSnap.id,
          ...(classSnap.data() as any),
        };
      });

      const classData = await Promise.all(classPromises);
      setClasses(classData);
    });
  }, [user?.uid, schoolKey]);

  const reloadStudents = useCallback(async () => {
    if (!user?.uid) return;

    if (classIds.length === 0) {
      setStudents([]);
      setStudentCount(0);
      setClasses((prev) => prev.map((c) => ({ ...c, studentCount: 0 })));
      return;
    }

    try {
      const { students: loadedStudents, totalCount, countByClass } =
        await loadStudentsForTeacher(user.uid);

      setStudentCount(totalCount);
      setStudents(loadedStudents);
      setClasses((prev) =>
        prev.map((c) => ({
          ...c,
          studentCount: countByClass.get(c.id) ?? 0,
        })),
      );
    } catch (error) {
      console.error("Failed to load teacher students:", error);
    }
  }, [user?.uid, classIds]);

  const reloadAnnouncements = useCallback(async () => {
    if (!user?.uid || classIds.length === 0) {
      setAnnouncements([]);
      return;
    }

    try {
      const loaded = await loadAnnouncementsForTeacher(classIds);
      setAnnouncements(loaded);
    } catch (error) {
      console.error("Failed to load teacher announcements:", error);
      setAnnouncements([]);
    }
  }, [user?.uid, classIds]);

  const reloadDashboard = useCallback(async () => {
    await Promise.all([reloadStudents(), reloadAnnouncements()]);
  }, [reloadStudents, reloadAnnouncements]);

  const scheduleReload = useCallback(() => {
    if (reloadDebounceRef.current) {
      clearTimeout(reloadDebounceRef.current);
    }
    reloadDebounceRef.current = setTimeout(() => {
      reloadDashboard();
    }, 400);
  }, [reloadDashboard]);

  useEffect(() => {
    reloadDashboard();
  }, [reloadDashboard]);

  useFocusEffect(
    useCallback(() => {
      reloadDashboard();
    }, [reloadDashboard]),
  );

  useFirestoreListenerEffect(() => {
    if (!user?.uid || !db || !schoolKey || classIds.length === 0) return;

    return classIds.map((classId) =>
      onSnapshot(
        query(
          collection(db, "studentClasses"),
          where("classId", "==", classId),
        ),
        () => scheduleReload(),
        (err) => {
          if (isIgnorableFirestoreListenerError(err)) return;
          console.error("studentClasses listener:", err);
        },
      ),
    );
  }, [user?.uid, classIds, scheduleReload, schoolKey]);

  useEffect(() => {
    return () => {
      if (reloadDebounceRef.current) {
        clearTimeout(reloadDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (classes.length === 0) {
      setSelectedClassId("");
      return;
    }
    setSelectedClassId((current) =>
      current && classes.some((c) => c.id === current) ? current : classes[0].id,
    );
  }, [classes]);

  const classNameById = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((cls) => {
      const label = cls.grade
        ? `${cls.name || t("common.class")} (${cls.grade})`
        : cls.name || t("common.class");
      map.set(cls.id, label);
    });
    return map;
  }, [classes, t]);

  const classChipOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: cls.id,
        label: `${classNameById.get(cls.id) ?? t("common.class")} (${cls.studentCount ?? 0})`,
      })),
    [classes, classNameById, t],
  );

  const filteredStudents = useMemo(() => {
    if (!selectedClassId) return [];
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  const selectedClassLabel = selectedClassId
    ? (classNameById.get(selectedClassId) ?? t("common.class"))
    : "";

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadDashboard();
    } finally {
      setRefreshing(false);
    }
  }, [reloadDashboard]);

  return {
    classes,
    studentCount,
    announcements,
    selectedClassId,
    setSelectedClassId,
    classChipOptions,
    filteredStudents,
    selectedClassLabel,
    refreshing,
    onRefresh,
  };
}
