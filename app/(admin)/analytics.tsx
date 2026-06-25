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
import { BarChart } from "react-native-chart-kit";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import type { TranslateFn } from "../../src/types/i18n";
import { platformShadow } from "../../src/utils/platformShadow";
import {
  adminChartConfig,
  AdminPieChart,
  barColorsFromHex,
  ChartCard,
  ChartLegend,
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
  t: TranslateFn,
  days: number,
): string {
  return days === ATTENDANCE_HISTORY_DAYS
    ? t("common.last90Days")
    : t("admin.lastNDays", { count: days });
}

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const chartWidth = useAdminChartWidth();
  const [stats, setStats] = useState<AdminAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setError(null);
    try {
      const data = await loadAdminAnalytics();
      setStats(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("admin.analyticsLoadFailed");
      console.error("Analytics load error:", err);
      setError(message);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadStats().finally(() => setLoading(false));
    }, [loadStats]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const s = stats ?? EMPTY_STATS;

  const pieData = useMemo(
    () =>
      [
        {
          name: t("admin.students"),
          population: s.students,
          color: "#16A34A",
          legendFontColor: "#334155",
          legendFontSize: 12,
        },
        {
          name: t("admin.teachers"),
          population: s.teachers,
          color: "#2563EB",
          legendFontColor: "#334155",
          legendFontSize: 12,
        },
        {
          name: t("admin.parents"),
          population: s.parents,
          color: "#7C3AED",
          legendFontColor: "#334155",
          legendFontSize: 12,
        },
        {
          name: t("common.homework"),
          population: s.homeworks,
          color: "#D97706",
          legendFontColor: "#334155",
          legendFontSize: 12,
        },
      ].filter((item) => item.population > 0),
    [s.students, s.teachers, s.parents, s.homeworks, t],
  );

  const hasPie = pieData.length > 0;
  const pieLegend = pieData.map((item) => ({
    name: item.name,
    color: item.color,
    value: item.population,
  }));

  const ACTIVITY_CHART_COLORS = [
    "#16A34A",
    "#2563EB",
    "#D97706",
    "#7C3AED",
  ] as const;

  const activityItems = useMemo(
    () =>
      [
        {
          label: t("admin.students"),
          value: s.students,
          color: ACTIVITY_CHART_COLORS[0],
        },
        {
          label: t("admin.teachers"),
          value: s.teachers,
          color: ACTIVITY_CHART_COLORS[1],
        },
        {
          label: t("admin.homeworkShort"),
          value: s.homeworks,
          color: ACTIVITY_CHART_COLORS[2],
        },
        {
          label: t("common.exams"),
          value: s.exams,
          color: ACTIVITY_CHART_COLORS[3],
        },
      ].filter((item) => item.value > 0),
    [s.students, s.teachers, s.homeworks, s.exams, t],
  );

  const hasActivityChart = activityItems.length > 0;
  const avgGradeDisplay = s.gradesCount > 0 ? `${s.avgGrade}%` : "—";
  const attendanceAbsent = Math.max(0, s.attendanceRecords - s.attendancePresent);
  const absenceRate =
    s.attendanceRecords > 0
      ? Number(((attendanceAbsent / s.attendanceRecords) * 100).toFixed(1))
      : 0;

  if (loading && !stats) {
    return (
      <AdminScreenShell
        title={t("admin.schoolAnalytics")}
        subtitle={t("admin.analyticsSubtitle")}
        showBack
      >
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.statusText}>{t("admin.analyticsLoading")}</Text>
        </View>
      </AdminScreenShell>
    );
  }

  return (
    <AdminScreenShell
      title={t("admin.schoolAnalytics")}
      subtitle={t("admin.analyticsSubtitle")}
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
            <Text style={styles.errorText}>{t("admin.analyticsLoadError")}</Text>
            <Text style={styles.errorDetail}>{error}</Text>
          </View>
        ) : null}

        <View style={[styles.summaryCard, layout.isWeb && styles.summaryCardWeb]}>
          <Text style={styles.summaryTitle}>{t("admin.overview")}</Text>
          <View style={styles.statsGrid}>
            <Stat label={t("admin.students")} value={s.students} web={layout.isWeb} />
            <Stat label={t("admin.teachers")} value={s.teachers} web={layout.isWeb} />
            <Stat label={t("admin.parents")} value={s.parents} web={layout.isWeb} />
            <Stat label={t("admin.classes")} value={s.classes} web={layout.isWeb} />
            <Stat label={t("common.homework")} value={s.homeworks} web={layout.isWeb} />
            <Stat label={t("common.exams")} value={s.exams} web={layout.isWeb} />
            <Stat label={t("common.remarks")} value={s.remarks} web={layout.isWeb} />
            <Stat label={t("common.average")} value={avgGradeDisplay} web={layout.isWeb} />
            {s.gradesSampleSize > 0 ? (
              <Text style={styles.gradeNote}>
                {t("admin.gradeAverageSample", { count: s.gradesSampleSize })}
              </Text>
            ) : null}
          </View>
        </View>

        {hasPie ? (
          <>
            <Text style={styles.section}>{t("admin.userActivityOverview")}</Text>
            <ChartCard>
              <AdminPieChart data={pieData} chartWidth={chartWidth} />
              <ChartLegend items={pieLegend} />
            </ChartCard>
          </>
        ) : (
          <Text style={styles.emptyChart}>{t("admin.noChartData")}</Text>
        )}

        {hasActivityChart ? (
          <ChartCard title={t("admin.activitySummary")}>
            <BarChart
              data={{
                labels: activityItems.map((item) => item.label),
                datasets: [
                  {
                    data: chartValues(activityItems.map((i) => i.value)),
                    colors: barColorsFromHex(activityItems.map((i) => i.color)),
                  },
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
              withCustomBarColorFromData
              flatColor
              showBarTops={false}
            />
            <ChartLegend
              items={activityItems.map((item) => ({
                name: item.label,
                value: item.value,
                color: item.color,
              }))}
            />
          </ChartCard>
        ) : (
          <Text style={styles.emptyChart}>{t("admin.noChartData")}</Text>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("admin.attendanceRate")}</Text>
          <Text style={styles.cardValue}>
            {absenceRate}% ({attendanceAbsent}/{s.attendanceRecords}{" "}
            {t("common.absent").toLowerCase()})
          </Text>
          <Text style={styles.cardDetail}>
            {attendanceHistoryLabelT(t, s.attendanceWindowDays)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("admin.assignments")}</Text>
          <Text style={styles.cardDetail}>
            {t("admin.assignmentsSummary", {
              studentLinks: s.studentClassLinks,
              teacherLinks: s.teacherClassLinks,
            })}
          </Text>
        </View>
      </ScrollView>
    </AdminScreenShell>
  );
}

function Stat({
  label,
  value,
  suffix,
  web = false,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  web?: boolean;
}) {
  return (
    <View style={[styles.statBox, web && styles.statBoxWeb]}>
      <Text style={styles.statBoxValue}>
        {value}
        {suffix}
      </Text>
      <Text style={styles.statBoxLabel}>{label}</Text>
    </View>
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
  section: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 12,
    color: "#0F172A",
  },
  statusText: {
    marginTop: 12,
    color: "#64748B",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  summaryCardWeb: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...platformShadow("lg"),
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  statBox: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statBoxWeb: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  statBoxValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  statBoxLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "600",
  },
  gradeNote: {
    width: "100%",
    fontSize: 12,
    color: "#64748B",
    marginTop: -6,
    marginBottom: 8,
    fontStyle: "italic",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "700",
  },
  errorDetail: {
    color: "#991B1B",
    fontSize: 13,
    marginTop: 4,
  },
  emptyChart: {
    color: "#64748B",
    marginBottom: 16,
    fontStyle: "italic",
  },
  chart: {
    borderRadius: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginTop: 12,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 8,
  },
  cardDetail: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 8,
    lineHeight: 20,
  },
});
