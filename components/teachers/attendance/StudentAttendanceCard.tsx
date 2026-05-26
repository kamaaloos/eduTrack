import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import type { TeacherAttendanceRecord } from "../../../src/services/teacherAttendanceResponses";
import { hasParentAttendanceResponse } from "../../../src/services/parentAttendanceResponse";
import { getAttendanceColor } from "../../../src/utils/dashboardUi";
import { attendanceStatusLabel } from "./attendanceStatusLabel";
import { teacherAttendanceStyles as styles } from "./teacherAttendanceStyles";
import type { StudentRow } from "./teacherAttendanceTypes";

type StudentAttendanceCardProps = {
  student: StudentRow;
  todayRecord?: TeacherAttendanceRecord;
  onMark: (status: "present" | "absent" | "late") => void;
};

export function StudentAttendanceCard({
  student,
  todayRecord,
  onMark,
}: StudentAttendanceCardProps) {
  const { t } = useTranslation();
  const colors = todayRecord
    ? getAttendanceColor(todayRecord.status, todayRecord.parentResponse)
    : null;
  const excused = todayRecord && hasParentAttendanceResponse(todayRecord);
  const displayName = student.name || student.email || t("common.student");

  return (
    <View style={styles.card}>
      <Text style={styles.cardName}>{displayName}</Text>

      {todayRecord && colors ? (
        <View
          style={[
            styles.statusPill,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.statusPillText, { color: colors.text }]}>
            {t("teacher.attendance.todayStatus")}:{" "}
            {attendanceStatusLabel(colors.label, t)}
          </Text>
        </View>
      ) : (
        <Text style={styles.noMark}>
          {t("teacher.attendance.notMarkedToday")}
        </Text>
      )}

      {excused && todayRecord?.parentResponse?.reason ? (
        <Text style={styles.parentReason}>
          {t("teacher.attendance.parentReason")}:{" "}
          {todayRecord.parentResponse.reason}
          {todayRecord.parentResponse.notes
            ? ` — ${todayRecord.parentResponse.notes}`
            : ""}
        </Text>
      ) : null}

      {todayRecord?.status === "absent" && !excused ? (
        <Text style={styles.waitingHint}>
          {t("teacher.attendance.waitingParent")}
        </Text>
      ) : null}

      <View style={styles.markRow}>
        <TouchableOpacity
          style={[styles.markBtn, styles.markPresent]}
          onPress={() => onMark("present")}
        >
          <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
          <Text style={styles.markBtnText}>
            {t("teacher.attendance.present")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.markBtn, styles.markAbsent]}
          onPress={() => onMark("absent")}
        >
          <Ionicons name="close-circle" size={22} color="#FFFFFF" />
          <Text style={styles.markBtnText}>
            {t("teacher.attendance.absent")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.markBtn, styles.markLate]}
          onPress={() => onMark("late")}
        >
          <Ionicons name="time" size={22} color="#FFFFFF" />
          <Text style={styles.markBtnText}>{t("teacher.attendance.late")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
