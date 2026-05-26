import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import {
  ACADEMIC_TABS,
  type AcademicTab,
} from "../components/teachers/academic/teacherAcademicTypes";
import { AuthContext } from "../src/context/authContext";
import { useTeacherClassesContext } from "../src/context/teacherClassesContext";
import {
  notifyAnnouncementPublished,
  notifyExamPublished,
  notifyHomeworkPublished,
  notifyRemarkPublished,
} from "../src/services/notificationEvents";
import { db } from "../src/services/firebase";
import { loadStudentsForClass } from "../src/services/teacherStudents";
import { loadSubjectsForTeacherClass } from "../src/services/teacherSubjects";

export function useTeacherAcademic() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();

  const {
    classes: assignedClasses,
    selectedClassId,
    setSelectedClassId,
    loading: loadingClasses,
    error: classesError,
    teacherId,
  } = useTeacherClassesContext();

  const [activeTab, setActiveTab] = useState<AcademicTab>("homework");
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [rating, setRating] = useState("");
  const [remarkType, setRemarkType] = useState("");
  const [remarkText, setRemarkText] = useState("");
  const [hwSubject, setHwSubject] = useState("");
  const [hwTitle, setHwTitle] = useState("");
  const [hwDaysLeft, setHwDaysLeft] = useState("");
  const [hwDetails, setHwDetails] = useState("");
  const [examSubject, setExamSubject] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examMarks, setExamMarks] = useState("");
  const [examDetails, setExamDetails] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [allowedSubjects, setAllowedSubjects] = useState<string[]>([]);

  const classOptions = useMemo(
    () =>
      (assignedClasses ?? []).map((cls) => ({
        value: cls.id,
        label: cls.grade
          ? `${cls.name || t("common.class")} (${cls.grade})`
          : cls.name || t("common.class"),
      })),
    [assignedClasses, t],
  );

  const studentSelectorItems = useMemo(
    () =>
      (students ?? []).map((s) => ({
        id: s.id,
        name:
          s.name ||
          s.email ||
          t("teacher.academic.studentIdFallback", {
            id: String(s.id).slice(0, 6),
          }),
      })),
    [students, t],
  );

  const remarkTypeOptions = useMemo(
    () => [
      { value: "compliment", label: t("teacher.academic.remarkTypeCompliment") },
      { value: "warning", label: t("teacher.academic.remarkTypeWarning") },
      { value: "absent", label: t("teacher.academic.remarkTypeAbsent") },
      { value: "late", label: t("teacher.academic.remarkTypeLate") },
      { value: "homework", label: t("teacher.academic.remarkTypeHomework") },
      { value: "performance", label: t("teacher.academic.remarkTypePerformance") },
    ],
    [t],
  );

  useEffect(() => {
    if (!teacherId || !selectedClassId) {
      setAllowedSubjects([]);
      setHwSubject("");
      setExamSubject("");
      return;
    }

    void loadSubjectsForTeacherClass(teacherId, selectedClassId).then((subjects) => {
      setAllowedSubjects(subjects);
      if (subjects.length === 1) {
        setHwSubject(subjects[0]);
        setExamSubject(subjects[0]);
      }
    });
  }, [teacherId, selectedClassId]);

  useEffect(() => {
    if (!teacherId || !selectedClassId) {
      setStudents([]);
      setSelectedStudentId("");
      setSelectedStudentName("");
      return;
    }

    let cancelled = false;
    setLoadingStudents(true);

    (async () => {
      try {
        const list = await loadStudentsForClass(teacherId, selectedClassId);
        if (cancelled) return;
        setStudents(list);
        setSelectedStudentId((prev) => {
          if (prev && list.some((s) => s.id === prev)) {
            const match = list.find((s) => s.id === prev);
            setSelectedStudentName(match?.name || match?.email || "");
            return prev;
          }
          setSelectedStudentName("");
          return "";
        });
      } catch (error) {
        console.error("Error loading students:", error);
        if (!cancelled) setStudents([]);
      } finally {
        if (!cancelled) setLoadingStudents(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [teacherId, selectedClassId]);

  useEffect(() => {
    setSelectedStudentId("");
    setSelectedStudentName("");
  }, [selectedClassId]);

  useEffect(() => {
    if (tabParam && ACADEMIC_TABS.includes(tabParam as AcademicTab)) {
      setActiveTab(tabParam as AcademicTab);
    }
  }, [tabParam]);

  const publishHomework = async () => {
    if (!selectedClassId) {
      Alert.alert(t("teacher.academic.alerts.selectClass"));
      return;
    }
    if (!hwSubject || !allowedSubjects.length) {
      Alert.alert(
        t("teacher.academic.alerts.subjectRequired"),
        t("teacher.academic.alerts.subjectRequiredMsg"),
      );
      return;
    }
    if (!hwTitle || !hwDaysLeft) {
      Alert.alert(t("teacher.academic.alerts.fillAllFields"));
      return;
    }

    try {
      await addDoc(collection(db, "classes", selectedClassId, "homework"), {
        subject: hwSubject,
        title: hwTitle,
        daysLeft: Number(hwDaysLeft),
        details: hwDetails.trim(),
        classId: selectedClassId,
        teacherId: user!.uid,
        teacherName: userData?.name || t("common.teacher"),
        createdAt: serverTimestamp(),
      });

      Alert.alert(t("common.success"), t("teacher.academic.alerts.homeworkPublished"));

      void notifyHomeworkPublished({
        classId: selectedClassId,
        title: hwTitle,
        subject: hwSubject,
        teacherName: userData?.name || t("common.teacher"),
        actorId: user!.uid,
      });

      setHwSubject("");
      setHwTitle("");
      setHwDaysLeft("");
      setHwDetails("");
    } catch (error) {
      console.error("Error publishing homework:", error);
      Alert.alert(
        t("common.error"),
        t("teacher.academic.alerts.publishHomeworkFailed", {
          message:
            error instanceof Error ? error.message : t("common.unknown"),
        }),
      );
    }
  };

  const publishExam = async () => {
    if (!selectedClassId) {
      Alert.alert(t("teacher.academic.alerts.selectClass"));
      return;
    }
    if (!examSubject || !allowedSubjects.length) {
      Alert.alert(
        t("teacher.academic.alerts.subjectRequired"),
        t("teacher.academic.alerts.subjectRequiredMsg"),
      );
      return;
    }

    try {
      await addDoc(collection(db, "classes", selectedClassId, "exams"), {
        subject: examSubject,
        title: examTitle,
        marks: Number(examMarks),
        details: examDetails.trim(),
        classId: selectedClassId,
        teacherId: user!.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert(t("common.success"), t("teacher.academic.alerts.examCreated"));

      void notifyExamPublished({
        classId: selectedClassId,
        title: examTitle || examSubject,
        subject: examSubject,
        actorId: user!.uid,
      });

      setExamSubject("");
      setExamTitle("");
      setExamMarks("");
      setExamDetails("");
    } catch (error) {
      console.log(error);
      Alert.alert(t("common.error"), t("teacher.academic.alerts.createExamFailed"));
    }
  };

  const publishRemark = async () => {
    if (!selectedClassId) {
      Alert.alert(t("teacher.academic.alerts.selectClass"));
      return;
    }
    if (!selectedStudentId) {
      Alert.alert(t("teacher.academic.alerts.selectStudent"));
      return;
    }
    if (!remarkText.trim()) {
      Alert.alert(t("teacher.academic.alerts.enterRemark"));
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);

    try {
      await addDoc(collection(db, "classes", selectedClassId, "remarks"), {
        studentId: selectedStudentId,
        studentName:
          student?.name ||
          student?.email ||
          selectedStudentName ||
          t("common.student"),
        teacherId: user!.uid,
        teacherName: userData?.name || user?.email || t("common.teacher"),
        classId: selectedClassId,
        text: remarkText.trim(),
        remark: remarkText.trim(),
        type: remarkType || "performance",
        rating: rating ? Number(rating) : null,
        createdAt: serverTimestamp(),
      });

      Alert.alert(t("common.success"), t("teacher.academic.alerts.remarkPublished"));

      void notifyRemarkPublished({
        classId: selectedClassId,
        studentId: selectedStudentId,
        studentName:
          student?.name ||
          student?.email ||
          selectedStudentName ||
          t("common.student"),
        preview: remarkText.trim().slice(0, 160),
        actorId: user!.uid,
      });

      setRemarkText("");
      setSelectedStudentId("");
      setSelectedStudentName("");
      setRating("");
      setRemarkType("");
    } catch (error) {
      console.log(error);
      Alert.alert(t("common.error"), t("teacher.academic.alerts.publishRemarkFailed"));
    }
  };

  const publishAnnouncement = async () => {
    if (!selectedClassId) {
      Alert.alert(t("teacher.academic.alerts.selectClass"));
      return;
    }

    try {
      await addDoc(collection(db, "classes", selectedClassId, "announcements"), {
        title: announcementTitle,
        text: announcementText,
        message: announcementText,
        icon: "📢",
        classId: selectedClassId,
        teacherId: user!.uid,
        createdAt: serverTimestamp(),
      });

      Alert.alert(
        t("common.success"),
        t("teacher.academic.alerts.announcementPublished"),
      );

      void notifyAnnouncementPublished({
        classId: selectedClassId,
        title:
          announcementTitle || t("teacher.academic.alerts.defaultAnnouncementTitle"),
        preview: announcementText.trim().slice(0, 160),
        actorId: user!.uid,
      });

      setAnnouncementTitle("");
      setAnnouncementText("");
    } catch (error) {
      console.log(error);
      Alert.alert(
        t("common.error"),
        t("teacher.academic.alerts.publishAnnouncementFailed"),
      );
    }
  };

  return {
    activeTab,
    setActiveTab,
    assignedClasses,
    selectedClassId,
    setSelectedClassId,
    loadingClasses,
    classesError,
    classOptions,
    allowedSubjects,
    students,
    loadingStudents,
    selectedStudentId,
    setSelectedStudentId,
    setSelectedStudentName,
    studentSelectorItems,
    remarkTypeOptions,
    hwSubject,
    setHwSubject,
    hwTitle,
    setHwTitle,
    hwDaysLeft,
    setHwDaysLeft,
    hwDetails,
    setHwDetails,
    examSubject,
    setExamSubject,
    examTitle,
    setExamTitle,
    examMarks,
    setExamMarks,
    examDetails,
    setExamDetails,
    remarkType,
    setRemarkType,
    remarkText,
    setRemarkText,
    rating,
    setRating,
    announcementTitle,
    setAnnouncementTitle,
    announcementText,
    setAnnouncementText,
    publishHomework,
    publishExam,
    publishRemark,
    publishAnnouncement,
  };
}
