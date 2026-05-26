import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { attendanceHistoryLabel } from "../../src/constants/attendanceHistory";
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
  const insets = useSafeAreaInsets();

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
      const gradeDisplay = buildGradeDisplayFromReport(report);

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
          label: `• ${e.subject || "Subject"} — ${e.title || e.date || "Scheduled"}`,
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
            ? `${presentCount} present of ${attendanceSummary.total} recorded days (${attendanceHistoryLabel()})`
            : empty.attendanceSummary,
        gradeAverage: gradeDisplay.gradeAverage,
        gradeSummary: gradeDisplay.gradeSummary,
        homeworkCount,
        homeworkSummary:
          homeworkCount > 0
            ? `${homeworkCount} assignment(s) from your class`
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
  }, [user?.uid, classId, userData?.classId, empty]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <View style={[styles.loadingWrap, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{t("student.performanceAnalytics")}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("common.attendance")}</Text>
        <Text style={styles.bigNumber}>
          {data.attendancePercent != null
            ? `${data.attendancePercent}%`
            : "—"}
        </Text>
        <Text style={styles.sub}>{data.attendanceSummary}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("student.gradeAverage")}</Text>
        <Text style={styles.bigNumber}>{data.gradeAverage}</Text>
        <Text style={styles.sub}>{data.gradeSummary}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("student.homework")}</Text>
        <Text style={styles.bigNumber}>{data.homeworkCount}</Text>
        <Text style={styles.sub}>{data.homeworkSummary}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("student.upcomingExams")}</Text>
        {data.upcomingExams.length === 0 ? (
          <Text style={styles.sub}>{t("student.noExams")}</Text>
        ) : (
          data.upcomingExams.map((exam, index) => (
            <Text key={index} style={styles.exam}>
              {exam.label}
            </Text>
          ))
        )}
      </View>

      <View style={styles.highlightCard}>
        <Text style={styles.highlightTitle}>{t("student.teacherInsight")}</Text>
        <Text style={styles.highlightText}>{data.latestRemark}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    paddingHorizontal: 20,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FB",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    color: "#111827",
  },
  card: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 22,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  bigNumber: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#2563EB",
    marginTop: 12,
  },
  sub: {
    color: "#64748B",
    marginTop: 10,
    lineHeight: 22,
    fontSize: 15,
  },
  exam: {
    marginTop: 12,
    fontSize: 15,
    color: "#334155",
    lineHeight: 22,
  },
  highlightCard: {
    backgroundColor: "#2563EB",
    padding: 24,
    borderRadius: 24,
    marginTop: 4,
  },
  highlightTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  highlightText: {
    color: "white",
    lineHeight: 26,
    fontSize: 16,
    flexShrink: 1,
  },
});
