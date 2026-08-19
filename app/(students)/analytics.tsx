import { ActivityIndicator, Text, View } from "react-native";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { attendanceHistoryLabelT } from "../../src/constants/attendanceHistory";
import { AuthContext } from "../../src/context/authContext";
import { db } from "../../src/services/firebase";
import {
  fetchStudentAttendanceHistory,
  summarizeAttendanceRecords,
} from "../../src/services/attendanceQueries";
import { generateReportCard } from "../../src/services/reportCardEngine";
import { filterUpcomingExams } from "../../src/utils/academicFilters";
import {
  buildGradeDisplayFromReport,
  extractRemarkText,
} from "../../src/utils/gradeAnalytics";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { studentScreenStyles as styles } from "../../components/students/studentScreenStyles";

type AnalyticsData = {
  attendancePercent: number | null;
  attendanceSummary: string;
  gradeAverage: string;
  gradeSummary: string;
  homeworkCount: number;
  homeworkSummary: string;
  upcomingExams: { label: string }[];
  latestRemark: string;
};

export default function StudentAnalyticsScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);

  const empty = useMemo<AnalyticsData>(
    () => ({
      attendancePercent: null,
      attendanceSummary: t("student.noAttendance"),
      gradeAverage: "—",
      gradeSummary: t("common.noData"),
      homeworkCount: 0,
      homeworkSummary: t("student.noHomework"),
      upcomingExams: [],
      latestRemark: t("common.noData"),
    }),
    [t],
  );
  const [classId, setClassId] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData>(empty);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setClassId(null);
      return;
    }
    if (userData?.classId) {
      setClassId(userData.classId);
      return;
    }

    (async () => {
      try {
        const linkSnap = await getDocs(
          query(
            collection(db, "studentClasses"),
            where("studentId", "==", user.uid),
          ),
        );
        setClassId(linkSnap.docs[0]?.data()?.classId ?? null);
      } catch {
        setClassId(null);
      }
    })();
  }, [user?.uid, userData?.classId]);

  const loadAnalytics = useCallback(async () => {
    if (!user?.uid) {
      setData(empty);
      setLoading(false);
      return;
    }

    const resolvedClassId = classId || userData?.classId || null;

    setLoading(true);
    try {
      const attendanceRecords = await fetchStudentAttendanceHistory(user.uid);
      const attendanceSummary = summarizeAttendanceRecords(attendanceRecords);
      const presentCount = attendanceSummary.present;
      const attendancePercent = attendanceSummary.rate;

      const report = await generateReportCard(user.uid, {
        classId: resolvedClassId,
      });
      const gradeDisplay = buildGradeDisplayFromReport(report, {
        emptySummary: t("student.noGradesYet"),
        subjectsSummary: (grade, count) =>
          t("student.gradeSummarySubjects", { grade, count }),
        examsSummary: (grade, count) =>
          t("student.gradeSummaryExams", { grade, count }),
      });

      let homeworkCount = 0;
      let upcomingExams: { label: string }[] = [];
      let latestRemark = empty.latestRemark;

      if (resolvedClassId) {
        const [hwSnap, examSnap, remarkSnap] = await Promise.all([
          getDocs(collection(db, "classes", resolvedClassId, "homework")),
          getDocs(collection(db, "classes", resolvedClassId, "exams")),
          getDocs(
            query(
              collection(db, "classes", resolvedClassId, "remarks"),
              where("studentId", "==", user.uid),
            ),
          ),
        ]);

        homeworkCount = hwSnap.size;

        const exams = filterUpcomingExams(
          examSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        );
        upcomingExams = exams.slice(0, 6).map((e: Record<string, unknown>) => ({
          label: t("student.upcomingExamLine", {
            subject: e.subject || t("student.examSubjectFallback"),
            title: e.title || e.date || t("student.examScheduledFallback"),
          }),
        }));

        const remarks = remarkSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta =
              (a.createdAt as { toMillis?: () => number })?.toMillis?.() ??
              ((a.createdAt as { seconds?: number })?.seconds ?? 0) * 1000;
            const tb =
              (b.createdAt as { toMillis?: () => number })?.toMillis?.() ??
              ((b.createdAt as { seconds?: number })?.seconds ?? 0) * 1000;
            return tb - ta;
          });

        const insight = extractRemarkText(remarks[0] as Record<string, unknown>);
        if (insight) latestRemark = insight;
      }

      setData({
        attendancePercent,
        attendanceSummary:
          attendancePercent != null
            ? t("student.attendancePresentOf", {
                present: presentCount,
                total: attendanceSummary.total,
                window: attendanceHistoryLabelT(t),
              })
            : empty.attendanceSummary,
        gradeAverage: gradeDisplay.gradeAverage,
        gradeSummary: gradeDisplay.gradeSummary,
        homeworkCount,
        homeworkSummary:
          homeworkCount > 0
            ? t("student.homeworkAssignedCount", { count: homeworkCount })
            : empty.homeworkSummary,
        upcomingExams,
        latestRemark,
      });
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setData(empty);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, classId, userData?.classId, empty, t]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <StudentScreenShell title={t("student.performanceAnalytics")} showMenu scroll={false}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </StudentScreenShell>
    );
  }

  return (
    <StudentScreenShell title={t("student.performanceAnalytics")} showMenu>
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{t("common.attendance")}</Text>
        <Text style={styles.metricValue}>
          {data.attendancePercent != null ? `${data.attendancePercent}%` : "—"}
        </Text>
        <Text style={styles.metricSub}>{data.attendanceSummary}</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{t("student.gradeAverage")}</Text>
        <Text style={styles.metricValue}>{data.gradeAverage}</Text>
        <Text style={styles.metricSub}>{data.gradeSummary}</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{t("student.homework")}</Text>
        <Text style={styles.metricValue}>{data.homeworkCount}</Text>
        <Text style={styles.metricSub}>{data.homeworkSummary}</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{t("student.upcomingExams")}</Text>
        {data.upcomingExams.length === 0 ? (
          <Text style={styles.metricSub}>{t("student.noExams")}</Text>
        ) : (
          data.upcomingExams.map((exam, index) => (
            <Text key={index} style={[styles.metricSub, { marginTop: index === 0 ? 8 : 4 }]}>
              {exam.label}
            </Text>
          ))
        )}
      </View>

      <View style={styles.highlightCard}>
        <Text style={styles.highlightTitle}>{t("student.teacherInsight")}</Text>
        <Text style={styles.highlightText}>{data.latestRemark}</Text>
      </View>
    </StudentScreenShell>
  );
}
