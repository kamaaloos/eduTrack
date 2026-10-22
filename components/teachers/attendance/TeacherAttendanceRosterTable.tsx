import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSchoolTheme } from "../../../src/context/schoolThemeContext";
import type { TeacherAttendanceRecord } from "../../../src/services/teacherAttendanceResponses";
import {
  ATTENDANCE_MARK_COLUMNS,
  resolveAttendanceColumn,
  type AttendanceMarkStatus,
} from "./attendanceMarkStatus";
import type { StudentRow, TodayMap } from "./teacherAttendanceTypes";

type TeacherAttendanceRosterTableProps = {
  students: StudentRow[];
  todayByStudent: TodayMap;
  onMark: (studentId: string, status: AttendanceMarkStatus) => void;
  onMarkAll: (status: AttendanceMarkStatus) => void;
};

function RadioDot({
  selected,
  primaryColor,
}: {
  selected: boolean;
  primaryColor: string;
}) {
  return (
    <View
      style={[
        styles.radioOuter,
        selected ? { borderColor: primaryColor } : null,
      ]}
    >
      {selected ? (
        <View style={[styles.radioInner, { backgroundColor: primaryColor }]} />
      ) : null}
    </View>
  );
}

function HeaderCheck({
  checked,
  onPress,
}: {
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [
        styles.headerCheck,
        checked ? styles.headerCheckOn : null,
        pressed ? styles.pressed : null,
        Platform.OS === "web" ? ({ cursor: "pointer" } as object) : null,
      ]}
    >
      {checked ? <Text style={styles.headerCheckMark}>✓</Text> : null}
    </Pressable>
  );
}

export function TeacherAttendanceRosterTable({
  students,
  todayByStudent,
  onMark,
  onMarkAll,
}: TeacherAttendanceRosterTableProps) {
  const { t } = useTranslation();
  const { theme, fontFamily } = useSchoolTheme();
  const primary = theme.primaryColor;

  const columnLabels: Record<AttendanceMarkStatus, string> = {
    present: t("teacher.attendance.colAttendance"),
    late: t("teacher.attendance.colLateness"),
    absent: t("teacher.attendance.colAbsence"),
    excused: t("teacher.attendance.colExcuse"),
  };

  const allSelected = useMemo(() => {
    const result: Record<AttendanceMarkStatus, boolean> = {
      present: false,
      late: false,
      absent: false,
      excused: false,
    };
    if (students.length === 0) return result;
    for (const status of ATTENDANCE_MARK_COLUMNS) {
      result[status] = students.every(
        (s) => resolveAttendanceColumn(todayByStudent[s.id]) === status,
      );
    }
    return result;
  }, [students, todayByStudent]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.count}>
        {students.length} {t("teacher.attendance.studentsInClass")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={Platform.OS === "web"}
        contentContainerStyle={styles.hScroll}
      >
        <View style={styles.table}>
          <View style={[styles.headerRow, { backgroundColor: primary }]}>
            <Text
              style={[
                styles.headerStudent,
                styles.headerText,
                fontFamily ? { fontFamily } : null,
              ]}
            >
              {t("teacher.attendance.colStudent")}
            </Text>
            {ATTENDANCE_MARK_COLUMNS.map((status) => (
              <View key={status} style={styles.headerCol}>
                <Text
                  style={[
                    styles.headerText,
                    styles.headerColLabel,
                    fontFamily ? { fontFamily } : null,
                  ]}
                  numberOfLines={1}
                >
                  {columnLabels[status]}
                </Text>
                <HeaderCheck
                  checked={allSelected[status]}
                  onPress={() => onMarkAll(status)}
                />
              </View>
            ))}
          </View>

          {students.map((student, index) => {
            const name =
              student.name || student.email || t("common.student");
            const selected = resolveAttendanceColumn(
              todayByStudent[student.id] as TeacherAttendanceRecord | undefined,
            );
            return (
              <View
                key={student.id}
                style={[
                  styles.row,
                  index % 2 === 1 ? styles.rowAlt : null,
                ]}
              >
                <Text style={styles.studentName} numberOfLines={2}>
                  {name}
                </Text>
                {ATTENDANCE_MARK_COLUMNS.map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => onMark(student.id, status)}
                    style={({ pressed }) => [
                      styles.cell,
                      pressed ? styles.pressed : null,
                      Platform.OS === "web"
                        ? ({ cursor: "pointer" } as object)
                        : null,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selected === status }}
                    accessibilityLabel={`${name}: ${columnLabels[status]}`}
                  >
                    <RadioDot
                      selected={selected === status}
                      primaryColor={primary}
                    />
                  </Pressable>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const STUDENT_COL = 200;
const STATUS_COL = 104;

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  count: {
    fontSize: 13,
    color: "#64748B",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  hScroll: {
    minWidth: "100%",
  },
  table: {
    minWidth: STUDENT_COL + STATUS_COL * 4,
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
  },
  headerText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  headerStudent: {
    width: STUDENT_COL,
    paddingRight: 8,
  },
  headerCol: {
    width: STATUS_COL,
    alignItems: "center",
    gap: 8,
  },
  headerColLabel: {
    textAlign: "center",
  },
  headerCheck: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCheckOn: {
    backgroundColor: "#FFFFFF",
  },
  headerCheckMark: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
    gap: 4,
    backgroundColor: "#FFFFFF",
  },
  rowAlt: {
    backgroundColor: "#F8FAFC",
  },
  studentName: {
    width: STUDENT_COL,
    paddingRight: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  cell: {
    width: STATUS_COL,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pressed: {
    opacity: 0.75,
  },
});
