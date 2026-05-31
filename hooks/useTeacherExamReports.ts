import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import type { ClassExam, ExamReportsMode } from "../components/teachers/examReports/examReportsTypes";
import { EXAM_REPORTS_STUDENTS_PAGE_SIZE } from "../components/teachers/examReports/examReportsTypes";
import { AuthContext } from "../src/context/authContext";
import { useSchoolContext } from "../src/context/schoolContext";
import { useTeacherClassesContext } from "../src/context/teacherClassesContext";
import { db } from "../src/services/firebase";
import {
  getExamResultsForClass,
  upsertExamResultForExam,
  type ExamResultRecord,
} from "../src/services/examResults";
import {
  loadStudentsForClass,
  type TeacherStudent,
} from "../src/services/teacherStudents";

export function useTeacherExamReports() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { selectedSchool } = useSchoolContext();
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    loading: classesLoading,
  } = useTeacherClassesContext();

  const [mode, setMode] = useState<ExamReportsMode>("grade");
  const [exams, setExams] = useState<ClassExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [results, setResults] = useState<ExamResultRecord[]>([]);
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reportSearch, setReportSearch] = useState("");
  const [gradeListLimit, setGradeListLimit] = useState(
    EXAM_REPORTS_STUDENTS_PAGE_SIZE,
  );
  const [reportListLimit, setReportListLimit] = useState(
    EXAM_REPORTS_STUDENTS_PAGE_SIZE,
  );
  const [exportingAllCertificates, setExportingAllCertificates] = useState(false);

  const classOptions = useMemo(
    () =>
      classes.map((c) => ({
        value: c.id,
        label: c.name || t("common.class"),
      })),
    [classes, t],
  );

  const selectedExam = exams.find((e) => e.id === selectedExamId);
  const maxMarks = selectedExam?.marks ?? null;

  const studentsInClass = useMemo(
    () => students.filter((s) => s.classId === selectedClassId),
    [students, selectedClassId],
  );

  const resultByStudent = useMemo(() => {
    const map = new Map<string, ExamResultRecord>();
    results
      .filter((r) => r.examId === selectedExamId)
      .forEach((r) => map.set(r.studentId, r));
    return map;
  }, [results, selectedExamId]);

  const gradedCount = useMemo(
    () =>
      studentsInClass.filter((s) => resultByStudent.get(s.id)?.graded).length,
    [studentsInClass, resultByStudent],
  );

  const classAverage = useMemo(() => {
    const scores = studentsInClass
      .map((s) => resultByStudent.get(s.id)?.score)
      .filter((n): n is number => n != null && Number.isFinite(n));
    if (scores.length === 0) return null;
    return Number(
      (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1),
    );
  }, [studentsInClass, resultByStudent]);

  const filteredReportStudents = useMemo(() => {
    const q = reportSearch.trim().toLowerCase();
    if (!q) return studentsInClass;
    return studentsInClass.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q),
    );
  }, [studentsInClass, reportSearch]);

  const examChipOptions = useMemo(
    () =>
      exams.map((e) => ({
        value: e.id,
        label: e.title || e.subject || t("teacher.examReports.examFallback"),
      })),
    [exams, t],
  );

  useEffect(() => {
    setGradeListLimit(EXAM_REPORTS_STUDENTS_PAGE_SIZE);
  }, [selectedClassId, selectedExamId, mode]);

  useEffect(() => {
    setReportListLimit(EXAM_REPORTS_STUDENTS_PAGE_SIZE);
  }, [selectedClassId, reportSearch, mode]);

  const visibleGradeStudents = useMemo(
    () => studentsInClass.slice(0, gradeListLimit),
    [studentsInClass, gradeListLimit],
  );

  const visibleReportStudents = useMemo(
    () => filteredReportStudents.slice(0, reportListLimit),
    [filteredReportStudents, reportListLimit],
  );

  const loadExamResults = useCallback(
    async (studentList: TeacherStudent[], examList: ClassExam[]) => {
      try {
        const classResults = await getExamResultsForClass(
          studentList.map((s) => s.id),
          examList.map((e) => e.id),
        );
        setResults(classResults);
      } catch (err) {
        console.error("exam-reports results:", err);
        setResults([]);
      }
    },
    [],
  );

  const loadData = useCallback(async () => {
    if (!user?.uid || !selectedClassId) {
      setExams([]);
      setStudents([]);
      setResults([]);
      return;
    }

    let loadError: string | null = null;

    try {
      const examsSnap = await getDocs(
        collection(db, "classes", selectedClassId, "exams"),
      );
      const loadedExams = examsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ClassExam, "id">),
      }));
      setExams(loadedExams);
      setSelectedExamId((prev) => {
        if (loadedExams.length === 0) return "";
        if (loadedExams.some((e) => e.id === prev)) return prev;
        return loadedExams[0].id;
      });
    } catch (err) {
      console.error("exam-reports exams:", err);
      setExams([]);
      loadError = t("teacher.examReports.loadExamsError");
    }

    try {
      const classStudents = await loadStudentsForClass(
        user.uid,
        selectedClassId,
      );
      setStudents(classStudents);
    } catch (err) {
      console.error("exam-reports students:", err);
      setStudents([]);
      loadError = loadError || t("teacher.examReports.loadStudentsError");
    }

    if (loadError) {
      Alert.alert(
        t("teacher.examReports.loadIssue"),
        t("teacher.examReports.loadIssueHint", { error: loadError }),
      );
    }
  }, [user?.uid, selectedClassId, t]);

  useEffect(() => {
    if (studentsInClass.length > 0 && exams.length > 0) {
      void loadExamResults(studentsInClass, exams);
    } else {
      setResults([]);
    }
  }, [studentsInClass, exams, loadExamResults]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadData();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadData]);

  useEffect(() => {
    const drafts: Record<string, string> = {};
    studentsInClass.forEach((s) => {
      const r = resultByStudent.get(s.id);
      if (r?.graded && r.score != null) {
        drafts[s.id] = String(r.score);
      }
    });
    setScoreDrafts(drafts);
  }, [selectedExamId, studentsInClass, resultByStudent]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const validateScore = (raw: string): number | null => {
    const num = Number(raw);
    if (!Number.isFinite(num) || num < 0) return null;
    if (maxMarks != null && num > maxMarks) return null;
    if (maxMarks == null && num > 100) return null;
    return num;
  };

  const updateScoreDraft = (studentId: string, text: string) => {
    setScoreDrafts((prev) => ({ ...prev, [studentId]: text }));
  };

  const saveScore = async (student: TeacherStudent) => {
    if (!selectedExam || !selectedClassId) {
      Alert.alert(t("teacher.examReports.selectExamFirst"));
      return;
    }

    const raw = scoreDrafts[student.id] ?? "";
    const num = validateScore(raw);
    if (num === null) {
      Alert.alert(
        t("teacher.examReports.invalidScore"),
        maxMarks != null
          ? t("teacher.examReports.invalidScoreRange", { max: maxMarks })
          : t("teacher.examReports.invalidScorePercent"),
      );
      return;
    }

    setSavingId(student.id);
    try {
      await upsertExamResultForExam({
        studentId: student.id,
        examId: selectedExam.id,
        classId: selectedClassId,
        subject: selectedExam.subject || t("teacher.examReports.generalSubject"),
        examTitle:
          selectedExam.title ||
          selectedExam.date ||
          t("teacher.examReports.examFallback"),
        score: num,
        maxMarks,
        teacherId: user?.uid,
      });
      await loadData();
      if (exams.length > 0) {
        await loadExamResults(studentsInClass, exams);
      }
      Alert.alert(
        t("teacher.examReports.saved"),
        t("teacher.examReports.scoreSavedFor", {
          name: student.name || t("common.student"),
        }),
      );
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error
          ? err.message
          : t("teacher.examReports.saveScoreError"),
      );
    } finally {
      setSavingId(null);
    }
  };

  const openReport = (student: TeacherStudent) => {
    router.push({
      pathname: "/(teachers)/student-report/[studentId]",
      params: {
        studentId: student.id,
        name: student.name || t("common.student"),
        classId: selectedClassId || student.classId || "",
      },
    });
  };

  const exportCertificate = async (student: TeacherStudent) => {
    if (!selectedExam || !selectedClassId) {
      Alert.alert(t("teacher.examReports.selectExamFirst"));
      return;
    }

    const result = resultByStudent.get(student.id);
    if (!result?.graded || result.score == null) {
      Alert.alert(
        t("teacher.examReports.certificateNeedsGrade"),
        t("teacher.examReports.certificateNeedsGradeHint"),
      );
      return;
    }

    try {
      const {
        getTermExamCertificateLabels,
        shareTermExamCertificatePdf,
        getPdfShareErrorKey,
      } = await import("../src/services/certificatePdfService");
      await shareTermExamCertificatePdf(
        buildTermExamCertificateParams(student, result),
        getTermExamCertificateLabels(t),
      );
    } catch (err) {
      const { getPdfShareErrorKey } = await import(
        "../src/services/certificatePdfService"
      );
      Alert.alert(t("common.error"), t(getPdfShareErrorKey(err)));
    }
  };

  const buildTermExamCertificateParams = (
    student: TeacherStudent,
    result: ExamResultRecord,
  ) => {
    const className =
      classes.find((item) => item.id === selectedClassId)?.name ||
      t("common.class");

    return {
      schoolName: selectedSchool?.name || t("certificates.schoolFallback"),
      className,
      studentName: student.name || t("common.student"),
      subject:
        selectedExam?.subject || t("teacher.examReports.generalSubject"),
      examTitle:
        selectedExam?.title ||
        selectedExam?.date ||
        t("teacher.examReports.examFallback"),
      examDate: selectedExam?.date,
      score: result.score!,
      maxMarks: result.maxMarks ?? maxMarks,
      teacherName: user?.displayName || undefined,
    };
  };

  const exportAllCertificates = async () => {
    if (!selectedExam || !selectedClassId) {
      Alert.alert(t("teacher.examReports.selectExamFirst"));
      return;
    }

    const graded = studentsInClass
      .map((student) => {
        const result = resultByStudent.get(student.id);
        if (!result?.graded || result.score == null) return null;
        return buildTermExamCertificateParams(student, result);
      })
      .filter((item): item is NonNullable<typeof item> => item != null);

    if (graded.length === 0) {
      Alert.alert(
        t("teacher.examReports.exportAllCertificatesNoneTitle"),
        t("teacher.examReports.exportAllCertificatesNoneHint"),
      );
      return;
    }

    setExportingAllCertificates(true);
    try {
      const {
        getTermExamCertificateLabels,
        shareTermExamCertificatesPdf,
        getPdfShareErrorKey,
      } = await import("../src/services/certificatePdfService");
      const labels = getTermExamCertificateLabels(t);
      const examSlug =
        selectedExam.title ||
        selectedExam.subject ||
        t("teacher.examReports.examFallback");
      const count = await shareTermExamCertificatesPdf(graded, labels, {
        fileName: `term-exam-${classNameSlug(selectedClassId)}-${examSlug}.pdf`,
        dialogTitle: labels.documentTitle,
      });
      Alert.alert(
        t("certificates.exportReadyTitle"),
        t("teacher.examReports.exportAllCertificatesReady", { count }),
      );
    } catch (err) {
      const { getPdfShareErrorKey } = await import(
        "../src/services/certificatePdfService"
      );
      Alert.alert(t("common.error"), t(getPdfShareErrorKey(err)));
    } finally {
      setExportingAllCertificates(false);
    }
  };

  function classNameSlug(classId: string): string {
    const name =
      classes.find((item) => item.id === classId)?.name || classId;
    return name.replace(/[^\w.-]+/g, "_");
  }

  const showMoreGradeStudents = () => {
    setGradeListLimit((n) =>
      Math.min(n + EXAM_REPORTS_STUDENTS_PAGE_SIZE, studentsInClass.length),
    );
  };

  const showMoreReportStudents = () => {
    setReportListLimit((n) =>
      Math.min(
        n + EXAM_REPORTS_STUDENTS_PAGE_SIZE,
        filteredReportStudents.length,
      ),
    );
  };

  return {
    classesLoading,
    classes,
    classOptions,
    selectedClassId,
    setSelectedClassId,
    mode,
    setMode,
    loading,
    refreshing,
    onRefresh,
    exams,
    selectedExamId,
    setSelectedExamId,
    selectedExam,
    maxMarks,
    examChipOptions,
    studentsInClass,
    gradedCount,
    classAverage,
    visibleGradeStudents,
    visibleReportStudents,
    filteredReportStudents,
    resultByStudent,
    scoreDrafts,
    savingId,
    reportSearch,
    setReportSearch,
    updateScoreDraft,
    saveScore,
    openReport,
    exportCertificate,
    exportAllCertificates,
    exportingAllCertificates,
    showMoreGradeStudents,
    showMoreReportStudents,
  };
}
