import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "expo-router";
import { BarChart, LineChart } from "react-native-chart-kit";
import {
  ACADEMIC_CHART_COLORS,
  adminChartConfig,
  ChartCard,
  ChartLegend,
  ROLE_CHART_COLORS,
  useAdminChartWidth,
} from "../../components/admin/adminChartHelpers";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import {
  chartValues,
  loadAdminAnalytics,
  type AdminAnalyticsStats,
} from "../../src/services/adminAnalytics";
import { ATTENDANCE_HISTORY_DAYS } from "../../src/constants/attendanceHistory";

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
  const chartWidth = useAdminChartWidth();
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

  const s = stats ?? EMPTY_STATS;

  const roleItems = useMemo(
    () =>
      [
        { label: t("admin.students"), value: s.students },
        { label: t("admin.teachers"), value: s.teachers },
        { label: t("admin.parents"), value: s.parents },
      ].filter((item) => item.value > 0),
    [s.students, s.teachers, s.parents, t],
  );

  const academicItems = useMemo(
    () =>
      [
        { label: t("common.homework"), value: s.homeworks },
        { label: t("common.exams"), value: s.exams },
        { label: t("common.remarks"), value: s.remarks },
      ].filter((item) => item.value > 0),
    [s.homeworks, s.exams, s.remarks, t],
  );

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

        <ChartCard
          title={t("admin.attendanceTrend")}
          caption={`${attendanceHistoryLabelT(t, s.attendanceWindowDays)} · ${t(
            "admin.presentCount",
            {
              present: s.attendancePresent,
              total: s.attendanceRecords,
            },
          )}`}
        >
          <LineChart
            data={{
              labels: [
                t("admin.chartPast"),
                t("admin.chartNow"),
                t("admin.chartTarget"),
              ],
              datasets: [{ data: attendanceLine }],
            }}
            width={chartWidth}
            height={220}
            yAxisSuffix="%"
            chartConfig={adminChartConfig}
            bezier
            style={styles.chart}
            fromZero
          />
        </ChartCard>

        {roleItems.length > 0 ? (
          <ChartCard title={t("admin.userDistribution")}>
            <BarChart
              data={{
                labels: roleItems.map((item) => item.label),
                datasets: [{ data: chartValues(roleItems.map((i) => i.value)) }],
              }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={adminChartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
            />
            <ChartLegend
              items={roleItems.map((item, index) => ({
                name: item.label,
                value: item.value,
                color: ROLE_CHART_COLORS[index % ROLE_CHART_COLORS.length],
              }))}
            />
          </ChartCard>
        ) : (
          <Text style={styles.emptyChart}>{t("admin.noChartData")}</Text>
        )}

        {academicItems.length > 0 ? (
          <ChartCard
            title={t("admin.academicActivity")}
            caption={t("admin.legacyCollectionsNote")}
          >
            <BarChart
              data={{
                labels: academicItems.map((item) => item.label),
                datasets: [
                  { data: chartValues(academicItems.map((i) => i.value)) },
                ],
              }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={adminChartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
            />
            <ChartLegend
              items={academicItems.map((item, index) => ({
                name: item.label,
                value: item.value,
                color: ACADEMIC_CHART_COLORS[index % ACADEMIC_CHART_COLORS.length],
              }))}
            />
          </ChartCard>
        ) : (
          <Text style={styles.emptyChart}>{t("admin.noChartData")}</Text>
        )}
      </ScrollView>
    </AdminScreenShell>
  );
}

const styles = StyleSheet.create({
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  chart: {
    borderRadius: 12,
  },
  emptyChart: {
    color: "#64748B",
    marginBottom: 16,
    fontStyle: "italic",
  },
});
