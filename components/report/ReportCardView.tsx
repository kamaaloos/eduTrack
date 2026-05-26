import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { ReportCardData } from "../../src/services/reportCardEngine";
import { attendanceHistoryLabel } from "../../src/constants/attendanceHistory";
import { FLOATING_TAB_BAR_INSET } from "../../src/constants/tabBar";
import { getAttendanceColor } from "../../src/utils/dashboardUi";
import { getAttendanceStatusLabel } from "../../src/utils/attendanceLabels";

type ReportCardViewProps = {
  report: ReportCardData;
  showParentSeen?: boolean;
};

function gradeColor(letter: string) {
  if (letter === "A") return "#059669";
  if (letter === "B") return "#2563EB";
  if (letter === "C") return "#D97706";
  if (letter === "D") return "#EA580C";
  return "#DC2626";
}

export function ReportCardView({
  report,
  showParentSeen = true,
}: ReportCardViewProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>{t("reportCard.heroEyebrow")}</Text>
        <Text style={styles.heroTitle}>{report.studentName}</Text>
        <Text style={styles.heroSub}>{t("reportCard.heroSub")}</Text>

        <View style={styles.heroStats}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{t("reportCard.average")}</Text>
            <Text style={styles.statValue}>
              {report.subjects.length > 0 || report.exams.some((e) => e.graded)
                ? `${report.average}%`
                : "—"}
            </Text>
          </View>
          <View style={[styles.statBox, styles.statBoxAccent]}>
            <Text style={styles.statLabel}>{t("reportCard.overall")}</Text>
            <Text
              style={[
                styles.statGrade,
                { color: gradeColor(report.grade) },
              ]}
            >
              {report.grade}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{t("common.attendance")}</Text>
            <Text style={styles.statValue}>
              {report.attendance.rate != null
                ? `${report.attendance.rate}%`
                : "—"}
            </Text>
          </View>
        </View>
        {report.attendance.total > 0 ? (
          <Text style={styles.heroFootnote}>
            {t("reportCard.attendanceFootnote", {
              present: report.attendance.present,
              total: report.attendance.total,
              window: attendanceHistoryLabel(),
            })}
          </Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>{t("reportCard.sectionAttendance")}</Text>
      {report.attendance.records.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={28} color="#94A3B8" />
          <Text style={styles.emptyText}>{t("reportCard.emptyAttendance")}</Text>
        </View>
      ) : (
        report.attendance.records.map((row) => {
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
                <Text style={[styles.attendanceBadgeText, { color: colors.text }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>{t("reportCard.sectionExams")}</Text>
      {report.exams.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={28} color="#94A3B8" />
          <Text style={styles.emptyText}>{t("reportCard.emptyExams")}</Text>
        </View>
      ) : (
        report.exams.map((exam) => (
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
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
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
        ))
      )}

      <Text style={styles.sectionTitle}>{t("reportCard.sectionSubjectGrades")}</Text>
      {report.subjects.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="school-outline" size={28} color="#94A3B8" />
          <Text style={styles.emptyText}>{t("reportCard.emptySubjects")}</Text>
        </View>
      ) : (
        report.subjects.map((s) => (
          <View key={s.subject} style={styles.subjectRow}>
            <View>
              <Text style={styles.subjectName}>{s.subject}</Text>
              <Text style={styles.subjectScore}>{s.score}%</Text>
            </View>
            <View
              style={[
                styles.letterBadge,
                { backgroundColor: `${gradeColor(s.grade)}18` },
              ]}
            >
              <Text
                style={[styles.letterBadgeText, { color: gradeColor(s.grade) }]}
              >
                {s.grade}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  content: { padding: 20, paddingBottom: FLOATING_TAB_BAR_INSET },
  hero: {
    backgroundColor: "#1E3A8A",
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    marginTop: 8,
  },
  heroEyebrow: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 4,
  },
  heroSub: { color: "#BFDBFE", fontSize: 14, marginBottom: 18 },
  heroStats: { flexDirection: "row", gap: 8 },
  heroFootnote: {
    color: "#93C5FD",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 12,
  },
  statBoxAccent: { backgroundColor: "rgba(255,255,255,0.2)" },
  statLabel: { color: "#BFDBFE", fontSize: 11, fontWeight: "600" },
  statValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "800", marginTop: 4 },
  statGrade: { fontSize: 26, fontWeight: "800", marginTop: 2 },
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
    borderColor: "#E2E8F0",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
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
  examCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  subjectName: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  subjectScore: { fontSize: 13, color: "#64748B", marginTop: 2 },
  letterBadge: {
    minWidth: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  letterBadgeText: { fontSize: 20, fontWeight: "800" },
});
