import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import type {
  ReportAttendanceRow,
  ReportExamRow,
} from "../../src/services/reportCardEngine";
import {
  buildMonthOptions,
  monthKeyFromDateKey,
  monthKeyFromDateLabel,
  pickDefaultMonthKey,
} from "../../src/utils/reportCardMonthFilter";
import { getAttendanceColor } from "../../src/utils/dashboardUi";
import { getAttendanceStatusLabel } from "../../src/utils/attendanceLabels";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { ListPageNav } from "../common/ListPageNav";
import { SelectChips } from "../teachers/SelectChips";
import { useLanguage } from "../../src/context/languageContext";

const WEB_LIST_PAGE_SIZE = 4;

type ReportCardWebAbsencesSectionProps = {
  records: ReportAttendanceRow[];
};

export function ReportCardWebAbsencesSection({
  records,
}: ReportCardWebAbsencesSectionProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const absentRecords = useMemo(
    () => records.filter((row) => row.status === "absent"),
    [records],
  );

  const monthKeys = useMemo(
    () =>
      absentRecords
        .map(
          (row) =>
            monthKeyFromDateKey(row.dateKey) ??
            monthKeyFromDateLabel(row.dateLabel),
        )
        .filter((key): key is string => Boolean(key)),
    [absentRecords],
  );

  const monthOptions = useMemo(
    () => buildMonthOptions(monthKeys, language),
    [language, monthKeys],
  );

  const monthKeysKey = monthKeys.join("|");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    pickDefaultMonthKey(monthKeys),
  );

  useEffect(() => {
    setSelectedMonth(pickDefaultMonthKey(monthKeys));
  }, [monthKeysKey, monthKeys]);

  const filtered = useMemo(
    () =>
      absentRecords.filter((row) => {
        const monthKey =
          monthKeyFromDateKey(row.dateKey) ??
          monthKeyFromDateLabel(row.dateLabel);
        return monthKey === selectedMonth;
      }),
    [absentRecords, selectedMonth],
  );

  const pagination = usePaginatedList(
    filtered,
    WEB_LIST_PAGE_SIZE,
    `${selectedMonth}:${filtered.length}`,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("reportCard.sectionAttendance")}</Text>
      <Text style={styles.sectionHint}>{t("reportCard.absencesOnlyHint")}</Text>

      {absentRecords.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={28} color="#94A3B8" />
          <Text style={styles.emptyText}>{t("reportCard.emptyAbsences")}</Text>
        </View>
      ) : monthOptions.length > 0 ? (
        <>
          <Text style={styles.filterLabel}>{t("reportCard.filterMonth")}</Text>
          <SelectChips
            options={monthOptions}
            selectedValue={selectedMonth}
            onSelect={setSelectedMonth}
          />

          {filtered.length === 0 ? (
            <Text style={styles.emptyInline}>{t("reportCard.noAbsencesMonth")}</Text>
          ) : (
            <>
              {pagination.totalPages > 1 ? (
                <View style={styles.pagination}>
                  <ListPageNav
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    canPrev={pagination.canPrev}
                    canNext={pagination.canNext}
                    onPrev={pagination.prevPage}
                    onNext={pagination.nextPage}
                  />
                </View>
              ) : null}

              {pagination.pageItems.map((row) => {
                const colors = getAttendanceColor(row.status, row.parentResponse);
                const statusLabel = getAttendanceStatusLabel(
                  t,
                  row.status,
                  row.parentResponse,
                );
                return (
                  <View key={row.id} style={styles.attendanceRow}>
                    <View style={styles.attendanceDateCol}>
                      <Text style={styles.attendanceDate}>{row.dateLabel}</Text>
                      {row.remark ? (
                        <Text style={styles.attendanceRemark} numberOfLines={2}>
                          {row.remark}
                        </Text>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.attendanceBadge,
                        { backgroundColor: colors.bg },
                      ]}
                    >
                      <Text
                        style={[styles.attendanceBadgeText, { color: colors.text }]}
                      >
                        {statusLabel}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </>
      ) : null}
    </View>
  );
}

type ReportCardWebExamsSectionProps = {
  exams: ReportExamRow[];
  showParentSeen: boolean;
};

export function ReportCardWebExamsSection({
  exams,
  showParentSeen,
}: ReportCardWebExamsSectionProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const monthKeys = useMemo(
    () =>
      exams
        .map(
          (exam) =>
            monthKeyFromDateKey(exam.examDateKey) ??
            monthKeyFromDateLabel(exam.dateLabel),
        )
        .filter((key): key is string => Boolean(key)),
    [exams],
  );

  const monthOptions = useMemo(
    () => buildMonthOptions(monthKeys, language),
    [language, monthKeys],
  );

  const monthKeysKey = monthKeys.join("|");
  const [selectedMonth, setSelectedMonth] = useState(() =>
    pickDefaultMonthKey(monthKeys),
  );

  useEffect(() => {
    setSelectedMonth(pickDefaultMonthKey(monthKeys));
  }, [monthKeysKey, monthKeys]);

  const filtered = useMemo(
    () =>
      exams.filter((exam) => {
        const monthKey =
          monthKeyFromDateKey(exam.examDateKey) ??
          monthKeyFromDateLabel(exam.dateLabel);
        return monthKey === selectedMonth;
      }),
    [exams, selectedMonth],
  );

  const pagination = usePaginatedList(
    filtered,
    WEB_LIST_PAGE_SIZE,
    `${selectedMonth}:${filtered.length}`,
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("reportCard.sectionExams")}</Text>

      {exams.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={28} color="#94A3B8" />
          <Text style={styles.emptyText}>{t("reportCard.emptyExams")}</Text>
        </View>
      ) : monthOptions.length > 0 ? (
        <>
          <Text style={styles.filterLabel}>{t("reportCard.filterMonth")}</Text>
          <SelectChips
            options={monthOptions}
            selectedValue={selectedMonth}
            onSelect={setSelectedMonth}
          />

          {filtered.length === 0 ? (
            <Text style={styles.emptyInline}>{t("reportCard.noExamsMonth")}</Text>
          ) : (
            <>
              {pagination.totalPages > 1 ? (
                <View style={styles.pagination}>
                  <ListPageNav
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    canPrev={pagination.canPrev}
                    canNext={pagination.canNext}
                    onPrev={pagination.prevPage}
                    onNext={pagination.nextPage}
                  />
                </View>
              ) : null}

              {pagination.pageItems.map((exam) => (
                <View key={exam.examId} style={styles.examCard}>
                  <View style={styles.examHeader}>
                    <View style={styles.examTitleCol}>
                      <Text style={styles.examTitle} numberOfLines={1}>
                        {exam.title}
                      </Text>
                      <Text style={styles.examSubject}>{exam.subject}</Text>
                    </View>
                    <View
                      style={[
                        styles.gradeBadge,
                        exam.graded ? styles.gradeBadgeOn : styles.gradeBadgeOff,
                      ]}
                    >
                      <Text
                        style={[
                          styles.gradeBadgeText,
                          exam.graded
                            ? styles.gradeBadgeTextOn
                            : styles.gradeBadgeTextOff,
                        ]}
                      >
                        {exam.graded
                          ? exam.maxMarks != null
                            ? `${exam.score}/${exam.maxMarks}`
                            : `${exam.score}%`
                          : t("reportCard.notGraded")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.examMetaRow}>
                    {exam.dateLabel ? (
                      <View style={styles.metaChip}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color="#64748B"
                        />
                        <Text style={styles.metaChipText}>{exam.dateLabel}</Text>
                      </View>
                    ) : null}

                    {showParentSeen ? (
                      <View
                        style={[
                          styles.metaChip,
                          exam.parentSeen
                            ? styles.metaChipSeen
                            : styles.metaChipUnseen,
                        ]}
                      >
                        <Ionicons
                          name={exam.parentSeen ? "eye" : "eye-off-outline"}
                          size={14}
                          color={exam.parentSeen ? "#059669" : "#B45309"}
                        />
                        <Text
                          style={[
                            styles.metaChipText,
                            exam.parentSeen
                              ? styles.metaSeenText
                              : styles.metaUnseenText,
                          ]}
                        >
                          {exam.parentSeen
                            ? t("reportCard.parentViewed")
                            : t("reportCard.notSeenByParent")}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </>
          )}
        </>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={28} color="#94A3B8" />
          <Text style={styles.emptyText}>{t("reportCard.emptyExams")}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
    lineHeight: 18,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },
  pagination: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyInline: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  attendanceDateCol: { flex: 1, minWidth: 0 },
  attendanceDate: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  attendanceRemark: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 16,
  },
  attendanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  attendanceBadgeText: { fontSize: 11, fontWeight: "800" },
  examCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  examHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  examTitleCol: { flex: 1, minWidth: 0 },
  examTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  examSubject: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7C3AED",
    marginTop: 2,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  gradeBadgeOn: { backgroundColor: "#DCFCE7" },
  gradeBadgeOff: { backgroundColor: "#F1F5F9" },
  gradeBadgeText: { fontSize: 12, fontWeight: "800" },
  gradeBadgeTextOn: { color: "#15803D" },
  gradeBadgeTextOff: { color: "#64748B" },
  examMetaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaChipSeen: { backgroundColor: "#ECFDF5" },
  metaChipUnseen: { backgroundColor: "#FFFBEB" },
  metaChipText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  metaSeenText: { color: "#059669" },
  metaUnseenText: { color: "#B45309" },
});
