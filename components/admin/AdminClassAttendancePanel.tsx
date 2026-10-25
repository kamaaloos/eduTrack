import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { UserData } from "../../hooks/useAdminUsers";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";
import {
  subscribeClassAttendance,
  type TeacherAttendanceRecord,
} from "../../src/services/teacherAttendanceResponses";
import { FormDateInput } from "../common/FormDateInput";
import { attendanceStatusLabel } from "../teachers/attendance/attendanceStatusLabel";

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function statusColor(status: string, primary: string): string {
  switch (status) {
    case "present":
      return "#166534";
    case "absent":
      return "#B91C1C";
    case "late":
      return "#B45309";
    case "excused":
      return primary;
    default:
      return "#64748B";
  }
}

type AdminClassAttendancePanelProps = {
  classId: string;
  students: UserData[];
};

export function AdminClassAttendancePanel({
  classId,
  students,
}: AdminClassAttendancePanelProps) {
  const { t } = useTranslation();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;
  const [date, setDate] = useState(todayKey());
  const [records, setRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId || !date) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeClassAttendance(
      classId,
      date.trim(),
      (next) => {
        setRecords(next);
        setLoading(false);
      },
      () => {
        setRecords([]);
        setLoading(false);
      },
    );
    return unsub;
  }, [classId, date]);

  const byStudent = useMemo(() => {
    const map = new Map<string, TeacherAttendanceRecord>();
    records.forEach((r) => map.set(r.studentId, r));
    return map;
  }, [records]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let unmarked = 0;
    students.forEach((s) => {
      const status = byStudent.get(s.id)?.status;
      if (status === "present") present += 1;
      else if (status === "absent") absent += 1;
      else if (status === "late") late += 1;
      else unmarked += 1;
    });
    return { present, absent, late, unmarked };
  }, [students, byStudent]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>{t("admin.classAttendanceHint")}</Text>
      <Text style={styles.label}>{t("admin.classAttendanceDate")}</Text>
      <FormDateInput
        style={styles.dateInput}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />

      <View style={styles.summaryRow}>
        <Text style={styles.summaryChip}>
          {t("common.present")}: {summary.present}
        </Text>
        <Text style={styles.summaryChip}>
          {t("common.absent")}: {summary.absent}
        </Text>
        <Text style={styles.summaryChip}>
          {t("common.late")}: {summary.late}
        </Text>
        <Text style={styles.summaryChip}>
          {t("admin.attendanceUnmarked")}: {summary.unmarked}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={primary} style={styles.loader} />
      ) : students.length === 0 ? (
        <Text style={styles.empty}>{t("admin.classStudentsEmpty")}</Text>
      ) : (
        <View style={styles.list}>
          {students.map((student, index) => {
            const record = byStudent.get(student.id);
            const status = record?.status?.trim() || "";
            const label = status
              ? attendanceStatusLabel(status.toUpperCase(), t)
              : t("admin.attendanceUnmarked");
            return (
              <View
                key={student.id}
                style={[
                  styles.row,
                  index === students.length - 1 && styles.rowLast,
                ]}
              >
                <Text style={styles.name} numberOfLines={2}>
                  {student.name || student.email || t("common.student")}
                </Text>
                <Text
                  style={[
                    styles.status,
                    { color: statusColor(status, primary) },
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryChip: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  loader: { marginTop: 16 },
  empty: {
    textAlign: "center",
    color: "#64748B",
    paddingVertical: 20,
  },
  list: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
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
  status: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
  },
});
