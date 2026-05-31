import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import { BarChart, LineChart } from "react-native-chart-kit";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import {
  chartValues,
  loadAdminAnalytics,
  type AdminAnalyticsStats,
} from "../../src/services/adminAnalytics";
import { ATTENDANCE_HISTORY_DAYS } from "../../src/constants/attendanceHistory";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#2563EB",
  },
};

const EMPTY_STATS: AdminAnalyticsStats = {
  students: 0,
  teachers: 0,
  parents: 0,
  admins: 0,
  classes: 0,
  homeworks: 0,
  exams: 0,
  remarks: 0,
  announcements: 0,
  attendanceRecords: 0,
  attendancePresent: 0,
  attendanceRate: 0,
  attendanceWindowDays: ATTENDANCE_HISTORY_DAYS,
  gradesCount: 0,
  avgGrade: 0,
  studentClassLinks: 0,
  teacherClassLinks: 0,
  gradesSampleSize: 0,
};

function attendanceHistoryLabelT(
  t: (key: string, opts?: object) => string,
  days: number,
): string {
  return days === ATTENDANCE_HISTORY_DAYS
    ? t("common.last90Days")
    : t("admin.lastNDays", { count: days });
}

export default function PerformanceCharts() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCharts = useCallback(async () => {
    setError(null);
    try {
      const data = await loadAdminAnalytics();
      setStats(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.performanceLoadFailed");
      console.error("Performance load error:", err);
      setError(message);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadCharts().finally(() => setLoading(false));
    }, [loadCharts]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCharts();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <AdminScreenShell
        title={t("admin.performance")}
        subtitle={t("admin.performanceSubtitle")}
        showBack
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>{t("admin.performanceLoading")}</Text>
        </View>
      </AdminScreenShell>
    );
  }

  const s = stats ?? EMPTY_STATS;
  const roleData = chartValues([s.students, s.teachers, s.parents]);
  const academicData = chartValues([s.homeworks, s.exams, s.remarks]);
  const attendanceLine = chartValues([
    s.attendanceRate,
    Math.max(s.attendanceRate - 5, 0),
    Math.min(s.attendanceRate + 5, 100),
  ]);
  const avgGradeDisplay = s.gradesCount > 0 ? `${s.avgGrade}%` : "—";
  const avgGradeLabel =
    s.gradesSampleSize > 0
      ? t("admin.avgGradeSample", { count: s.gradesSampleSize })
      : t("admin.avgGradeNoScores");

  return (
    <AdminScreenShell
      title={t("admin.performance")}
      subtitle={t("admin.performanceSubtitle")}
      showBack
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{t("admin.performanceLoadError")}</Text>
            <Text style={styles.errorDetail}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{s.attendanceRate}%</Text>
            <Text style={styles.summaryLabel}>{t("common.attendance")}</Text>
            <Text style={styles.summaryHint}>
              {attendanceHistoryLabelT(t, s.attendanceWindowDays)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{avgGradeDisplay}</Text>
            <Text style={styles.summaryLabel}>{avgGradeLabel}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>{t("admin.attendanceTrend")}</Text>
          <LineChart
            data={{
              labels: [
                t("admin.chartPast"),
                t("admin.chartNow"),
                t("admin.chartTarget"),
              ],
              datasets: [{ data: attendanceLine }],
            }}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix="%"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
          <Text style={styles.caption}>
            {attendanceHistoryLabelT(t, s.attendanceWindowDays)} ·{" "}
            {t("admin.presentCount", {
              present: s.attendancePresent,
              total: s.attendanceRecords,
            })}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>{t("admin.userDistribution")}</Text>
          <BarChart
            data={{
              labels: [
                t("admin.students"),
                t("admin.teachers"),
                t("admin.parents"),
              ],
              datasets: [{ data: roleData }],
            }}
            width={screenWidth - 40}
            height={250}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>{t("admin.academicActivity")}</Text>
          <BarChart
            data={{
              labels: [
                t("common.homework"),
                t("common.exams"),
                t("common.remarks"),
              ],
              datasets: [{ data: academicData }],
            }}
            width={screenWidth - 40}
            height={250}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
          />
          <Text style={styles.caption}>{t("admin.legacyCollectionsNote")}</Text>
        </View>
      </ScrollView>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    marginTop: 12,
    color: "#64748B",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2563EB",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "600",
  },
  summaryHint: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "500",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#B91C1C",
    fontWeight: "700",
  },
  errorDetail: {
    color: "#991B1B",
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0F172A",
  },
  chart: {
    borderRadius: 16,
  },
  caption: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 10,
    lineHeight: 18,
  },
});
