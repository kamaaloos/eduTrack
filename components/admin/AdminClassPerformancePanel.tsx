import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getDocs } from "firebase/firestore";
import type { UserData } from "../../hooks/useAdminUsers";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import {
  buildClassAttendanceSinceQuery,
  summarizeAttendanceRecords,
  type AttendanceRecord,
} from "../../src/services/attendanceQueries";

type StudentPerf = {
  id: string;
  name: string;
  monthTotal: number;
  monthPresent: number;
  windowTotal: number;
  windowPresent: number;
};

type AdminClassPerformancePanelProps = {
  classId: string;
  students: UserData[];
};

function monthPrefix(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function AdminClassPerformancePanel({
  classId,
  students,
}: AdminClassPerformancePanelProps) {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const monthKey = monthPrefix();

  const load = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    try {
      const snap = await getDocs(buildClassAttendanceSinceQuery(classId));
      setRecords(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AttendanceRecord),
      );
    } catch (err) {
      console.warn("AdminClassPerformancePanel:", err);
      setError(t("admin.classPerformanceLoadError"));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [classId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const monthRecords = useMemo(
    () => records.filter((r) => String(r.date ?? "").startsWith(monthKey)),
    [records, monthKey],
  );

  const windowSummary = useMemo(
    () => summarizeAttendanceRecords(records),
    [records],
  );
  const monthSummary = useMemo(
    () => summarizeAttendanceRecords(monthRecords),
    [monthRecords],
  );

  const perStudent = useMemo((): StudentPerf[] => {
    return students
      .map((student) => {
        const all = records.filter((r) => r.studentId === student.id);
        const month = all.filter((r) =>
          String(r.date ?? "").startsWith(monthKey),
        );
        return {
          id: student.id,
          name: student.name || student.email || t("common.student"),
          monthTotal: month.length,
          monthPresent: month.filter((r) => r.status === "present").length,
          windowTotal: all.length,
          windowPresent: all.filter((r) => r.status === "present").length,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [students, records, monthKey, t]);

  if (loading) {
    return <ActivityIndicator color={primary} style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>{t("admin.classPerformanceHint")}</Text>

      <View style={styles.cards}>
        <View style={[styles.card, { borderColor: `${primary}55` }]}>
          <Text style={styles.cardLabel}>{t("admin.classPerfThisMonth")}</Text>
          <Text style={[styles.cardValue, { color: primary }]}>
            {monthSummary.rate != null ? `${monthSummary.rate}%` : "—"}
          </Text>
          <Text style={styles.cardSub}>
            {t("admin.presentCount", {
              present: monthSummary.present,
              total: monthSummary.total,
            })}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{t("admin.classPerfWindow")}</Text>
          <Text style={styles.cardValue}>
            {windowSummary.rate != null ? `${windowSummary.rate}%` : "—"}
          </Text>
          <Text style={styles.cardSub}>
            {t("admin.presentCount", {
              present: windowSummary.present,
              total: windowSummary.total,
            })}
          </Text>
          <Text style={styles.cardMeta}>
            {t("admin.classPerfSince", { date: windowSummary.sinceDate })}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("admin.classPerfByStudent")}</Text>
      {perStudent.length === 0 ? (
        <Text style={styles.empty}>{t("admin.classStudentsEmpty")}</Text>
      ) : (
        <View style={styles.list}>
          {perStudent.map((row, index) => {
            const monthRate =
              row.monthTotal > 0
                ? Math.round((row.monthPresent / row.monthTotal) * 100)
                : null;
            const windowRate =
              row.windowTotal > 0
                ? Math.round((row.windowPresent / row.windowTotal) * 100)
                : null;
            return (
              <View
                key={row.id}
                style={[
                  styles.row,
                  index === perStudent.length - 1 && styles.rowLast,
                ]}
              >
                <Text style={styles.name} numberOfLines={2}>
                  {row.name}
                </Text>
                <View style={styles.rates}>
                  <Text style={styles.rateLine}>
                    {t("admin.classPerfMonthShort")}:{" "}
                    {monthRate != null ? `${monthRate}%` : "—"}
                  </Text>
                  <Text style={styles.rateLineMuted}>
                    {t("admin.classPerfWindowShort")}:{" "}
                    {windowRate != null ? `${windowRate}%` : "—"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  loader: { marginTop: 20 },
  error: { color: "#B91C1C", fontWeight: "600" },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    padding: 14,
    gap: 4,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardSub: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  cardMeta: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 4,
  },
  empty: {
    textAlign: "center",
    color: "#64748B",
    paddingVertical: 16,
  },
  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rowLast: { borderBottomWidth: 0 },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  rates: { alignItems: "flex-end" },
  rateLine: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  rateLineMuted: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
});
