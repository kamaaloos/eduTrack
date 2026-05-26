import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, getDocs } from "firebase/firestore";
import { SelectChips } from "../../components/teachers/SelectChips";
import { AuthContext } from "../../src/context/authContext";
import { useTeacherClassesContext } from "../../src/context/teacherClassesContext";
import { db } from "../../src/services/firebase";
import {
  getExamResultsForClass,
  upsertExamResultForExam,
  type ExamResultRecord,
} from "../../src/services/examResults";
import { loadStudentsForClass } from "../../src/services/teacherStudents";
import type { TeacherStudent } from "../../src/services/teacherStudents";

type ClassExam = {
  id: string;
  subject?: string;
  title?: string;
  date?: string;
  marks?: number;
};

type Mode = "grade" | "reports";

const STUDENTS_PAGE_SIZE = 5;

function scoreLabel(score: number | null, maxMarks: number | null) {
  if (score == null) return "—";
  if (maxMarks != null) return `${score}/${maxMarks}`;
  return `${score}%`;
}

export default function TeacherExamReportsScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { classes, selectedClassId, setSelectedClassId, loading: classesLoading } =
    useTeacherClassesContext();

  const [mode, setMode] = useState<Mode>("grade");
  const [exams, setExams] = useState<ClassExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [results, setResults] = useState<ExamResultRecord[]>([]);
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [reportSearch, setReportSearch] = useState("");
  const [gradeListLimit, setGradeListLimit] = useState(STUDENTS_PAGE_SIZE);
  const [reportListLimit, setReportListLimit] = useState(STUDENTS_PAGE_SIZE);

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

  const gradedCount = useMemo(() => {
    return studentsInClass.filter((s) => resultByStudent.get(s.id)?.graded).length;
  }, [studentsInClass, resultByStudent]);

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

  useEffect(() => {
    setGradeListLimit(STUDENTS_PAGE_SIZE);
  }, [selectedClassId, selectedExamId, mode]);

  useEffect(() => {
    setReportListLimit(STUDENTS_PAGE_SIZE);
  }, [selectedClassId, reportSearch, mode]);

  const visibleGradeStudents = useMemo(
    () => studentsInClass.slice(0, gradeListLimit),
    [studentsInClass, gradeListLimit],
  );

  const visibleReportStudents = useMemo(
    () => filteredReportStudents.slice(0, reportListLimit),
    [filteredReportStudents, reportListLimit],
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
        err instanceof Error ? err.message : t("teacher.examReports.saveScoreError"),
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

  const renderShowMore = (
    shown: number,
    total: number,
    onPress: () => void,
  ) => {
    if (shown >= total) return null;
    return (
      <TouchableOpacity style={styles.showMoreBtn} onPress={onPress}>
        <Text style={styles.showMoreText}>
          {t("teacher.examReports.showMore", { remaining: total - shown })}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#2563EB" />
      </TouchableOpacity>
    );
  };

  if (classesLoading || (loading && classes.length === 0)) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  if (classes.length === 0) {
    return (
      <SafeAreaView style={styles.centered} edges={["top"]}>
        <Text style={styles.emptyTitle}>
          {t("teacher.examReports.noClassesAssigned")}
        </Text>
        <Text style={styles.emptySub}>{t("teacher.examReports.noClassesSub")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.pageTitle}>{t("teacher.examReports.pageTitle")}</Text>
      <Text style={styles.pageSub}>{t("teacher.examReports.pageSub")}</Text>

      <Text style={styles.label}>{t("common.class")}</Text>
      <SelectChips
        options={classOptions}
        selectedValue={selectedClassId}
        onSelect={setSelectedClassId}
      />

      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "grade" && styles.modeBtnActive]}
          onPress={() => setMode("grade")}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === "grade" && styles.modeBtnTextActive,
            ]}
          >
            {t("teacher.examReports.gradeExams")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === "reports" && styles.modeBtnActive]}
          onPress={() => setMode("reports")}
        >
          <Text
            style={[
              styles.modeBtnText,
              mode === "reports" && styles.modeBtnTextActive,
            ]}
          >
            {t("teacher.examReports.studentReports")}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color="#2563EB" />
      ) : mode === "grade" ? (
        <>
          {exams.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t("teacher.examReports.noExams")}</Text>
              <Text style={styles.emptySub}>{t("teacher.examReports.noExamsSub")}</Text>
            </View>
          ) : (
            <>
              <Text style={styles.label}>{t("common.exams")}</Text>
              <SelectChips
                options={exams.map((e) => ({
                  value: e.id,
                  label: e.title || e.subject || t("teacher.examReports.examFallback"),
                }))}
                selectedValue={selectedExamId}
                onSelect={setSelectedExamId}
              />

              {selectedExam ? (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryChip}>
                    <Text style={styles.summaryLabel}>{t("teacher.examReports.graded")}</Text>
                    <Text style={styles.summaryValue}>
                      {gradedCount}/{studentsInClass.length}
                    </Text>
                  </View>
                  <View style={styles.summaryChip}>
                    <Text style={styles.summaryLabel}>{t("teacher.examReports.classAvg")}</Text>
                    <Text style={styles.summaryValue}>
                      {classAverage != null
                        ? maxMarks != null
                          ? `${classAverage}/${maxMarks}`
                          : `${classAverage}%`
                        : "—"}
                    </Text>
                  </View>
                  {maxMarks != null ? (
                    <View style={styles.summaryChip}>
                      <Text style={styles.summaryLabel}>{t("teacher.examReports.outOf")}</Text>
                      <Text style={styles.summaryValue}>{maxMarks}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {studentsInClass.length === 0 ? (
                <Text style={styles.emptySub}>
                  {t("teacher.examReports.noStudentsInClass")}
                </Text>
              ) : (
                <>
                  <Text style={styles.listHint}>
                    {t("teacher.examReports.showingStudents", {
                      shown: visibleGradeStudents.length,
                      total: studentsInClass.length,
                    })}
                  </Text>
                  {visibleGradeStudents.map((student) => {
                  const result = resultByStudent.get(student.id);
                  const graded = Boolean(result?.graded);
                  const parentSeen = Boolean(result?.parentSeenAt);

                  return (
                    <View key={student.id} style={styles.studentRow}>
                      <View style={styles.studentRowTop}>
                        <View style={styles.studentInfo}>
                          <Text style={styles.studentName}>
                            {student.name || t("common.student")}
                          </Text>
                          <View style={styles.badgeRow}>
                            <View
                              style={[
                                styles.badge,
                                graded ? styles.badgeGraded : styles.badgePending,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgeText,
                                  graded
                                    ? styles.badgeTextGraded
                                    : styles.badgeTextPending,
                                ]}
                              >
                                {graded
                                  ? scoreLabel(result?.score ?? null, maxMarks)
                                  : t("teacher.examReports.notGraded")}
                              </Text>
                            </View>
                            <View
                              style={[
                                styles.badge,
                                parentSeen
                                  ? styles.badgeSeen
                                  : styles.badgeUnseen,
                              ]}
                            >
                              <Ionicons
                                name={parentSeen ? "eye" : "eye-off-outline"}
                                size={12}
                                color={parentSeen ? "#059669" : "#B45309"}
                              />
                              <Text
                                style={[
                                  styles.badgeText,
                                  parentSeen
                                    ? styles.badgeTextSeen
                                    : styles.badgeTextUnseen,
                                ]}
                              >
                                {parentSeen
                                  ? t("teacher.examReports.parentSaw")
                                  : t("teacher.examReports.notSeen")}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => openReport(student)}
                          style={styles.reportLink}
                        >
                          <Text style={styles.reportLinkText}>
                            {t("teacher.examReports.report")}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.scoreRow}>
                        <TextInput
                          style={styles.scoreInput}
                          placeholder={
                            maxMarks != null ? `0–${maxMarks}` : "0–100"
                          }
                          keyboardType="numeric"
                          value={scoreDrafts[student.id] ?? ""}
                          onChangeText={(text) =>
                            setScoreDrafts((prev) => ({
                              ...prev,
                              [student.id]: text,
                            }))
                          }
                        />
                        <TouchableOpacity
                          style={[
                            styles.saveBtn,
                            savingId === student.id && styles.saveBtnDisabled,
                          ]}
                          onPress={() => saveScore(student)}
                          disabled={savingId === student.id}
                        >
                          {savingId === student.id ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                          ) : (
                            <Text style={styles.saveBtnText}>{t("common.save")}</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
                  {renderShowMore(
                    visibleGradeStudents.length,
                    studentsInClass.length,
                    () =>
                      setGradeListLimit((n) =>
                        Math.min(n + STUDENTS_PAGE_SIZE, studentsInClass.length),
                      ),
                  )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <TextInput
            style={styles.search}
            placeholder={t("teacher.examReports.searchStudents")}
            value={reportSearch}
            onChangeText={setReportSearch}
          />
          {filteredReportStudents.length === 0 ? (
            <Text style={styles.emptySub}>
              {t("teacher.examReports.noSearchMatch")}
            </Text>
          ) : (
            <>
              <Text style={styles.listHint}>
                {t("teacher.examReports.showingStudents", {
                  shown: visibleReportStudents.length,
                  total: filteredReportStudents.length,
                })}
              </Text>
              {visibleReportStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={styles.reportRow}
                onPress={() => openReport(student)}
                activeOpacity={0.85}
              >
                <View style={styles.reportAvatar}>
                  <Text style={styles.reportAvatarText}>
                    {(student.name || "S").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reportRowText}>
                  <Text style={styles.studentName}>
                    {student.name || t("common.student")}
                  </Text>
                  <Text style={styles.reportRowSub}>
                    {t("teacher.examReports.reportRowSub")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            ))}
              {renderShowMore(
                visibleReportStudents.length,
                filteredReportStudents.length,
                () =>
                  setReportListLimit((n) =>
                    Math.min(
                      n + STUDENTS_PAGE_SIZE,
                      filteredReportStudents.length,
                    ),
                  ),
              )}
            </>
          )}
        </>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 20, paddingTop: 8 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "transparent",
  },
  pageTitle: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  pageSub: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    marginTop: 8,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },
  modeBtnActive: { backgroundColor: "#1E40AF" },
  modeBtnText: { fontWeight: "700", color: "#475569", fontSize: 14 },
  modeBtnTextActive: { color: "#FFFFFF" },
  loader: { marginVertical: 24 },
  listHint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 10,
    fontWeight: "600",
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    marginBottom: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  showMoreText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 14 },
  summaryChip: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  summaryLabel: { fontSize: 11, fontWeight: "600", color: "#64748B" },
  summaryValue: { fontSize: 16, fontWeight: "800", color: "#1E40AF", marginTop: 2 },
  studentRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  studentRowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  studentInfo: { flex: 1, minWidth: 0 },
  studentName: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGraded: { backgroundColor: "#DCFCE7" },
  badgePending: { backgroundColor: "#F1F5F9" },
  badgeSeen: { backgroundColor: "#ECFDF5" },
  badgeUnseen: { backgroundColor: "#FFFBEB" },
  badgeText: { fontSize: 11, fontWeight: "700" },
  badgeTextGraded: { color: "#15803D" },
  badgeTextPending: { color: "#64748B" },
  badgeTextSeen: { color: "#059669" },
  badgeTextUnseen: { color: "#B45309" },
  reportLink: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
  },
  reportLinkText: { color: "#2563EB", fontWeight: "700", fontSize: 12 },
  scoreRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  scoreInput: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 72,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#FFFFFF", fontWeight: "700" },
  search: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reportAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  reportAvatarText: { color: "#1D4ED8", fontWeight: "800", fontSize: 18 },
  reportRowText: { flex: 1, minWidth: 0 },
  reportRowSub: { fontSize: 12, color: "#64748B", marginTop: 4 },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#475569" },
  emptySub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
