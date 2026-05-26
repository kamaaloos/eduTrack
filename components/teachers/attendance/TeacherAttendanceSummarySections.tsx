import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import type { TeacherAttendanceRecord } from "../../../src/services/teacherAttendanceResponses";
import { getAttendanceColor } from "../../../src/utils/dashboardUi";
import { attendanceStatusLabel } from "./attendanceStatusLabel";
import { teacherAttendanceStyles as styles } from "./teacherAttendanceStyles";

type TeacherAttendanceSummarySectionsProps = {
  classId: string;
  pendingToday: TeacherAttendanceRecord[];
  excusedToday: TeacherAttendanceRecord[];
  recentAbsents: TeacherAttendanceRecord[];
  studentNameById: Map<string, string>;
  onSelectStudent: (id: string) => void;
};

export function TeacherAttendanceSummarySections({
  classId,
  pendingToday,
  excusedToday,
  recentAbsents,
  studentNameById,
  onSelectStudent,
}: TeacherAttendanceSummarySectionsProps) {
  const { t } = useTranslation();

  if (!classId) return null;

  return (
    <>
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "#DC2626" }]} />
          <Text style={styles.legendText}>
            {t("teacher.attendance.legendAbsent")}
          </Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: "#16A34A" }]} />
          <Text style={styles.legendText}>
            {t("teacher.attendance.legendExcused")}
          </Text>
        </View>
      </View>

      {pendingToday.length > 0 ? (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>
            {t("teacher.attendance.awaitingParentSection")} ({pendingToday.length})
          </Text>
          {pendingToday.map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => onSelectStudent(r.studentId)}
            >
              <Text style={styles.sectionItem}>
                • {studentNameById.get(r.studentId) || t("common.student")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {excusedToday.length > 0 ? (
        <View style={[styles.sectionBox, styles.sectionBoxGreen]}>
          <Text style={styles.sectionTitle}>
            {t("teacher.attendance.parentExplainedToday")} ({excusedToday.length})
          </Text>
          {excusedToday.map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => onSelectStudent(r.studentId)}
            >
              <Text style={styles.sectionItem}>
                • {studentNameById.get(r.studentId) || t("common.student")} —{" "}
                {r.parentResponse?.reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {recentAbsents.length > 0 ? (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>
            {t("teacher.attendance.recentAbsences")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentAbsents.slice(0, 12).map((r) => {
              const colors = getAttendanceColor("absent", r.parentResponse);
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => onSelectStudent(r.studentId)}
                  style={[
                    styles.recentCard,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.bg,
                    },
                  ]}
                >
                  <Text style={styles.recentDate}>{r.date}</Text>
                  <Text style={styles.recentName} numberOfLines={1}>
                    {studentNameById.get(r.studentId) || t("common.student")}
                  </Text>
                  <Text style={[styles.recentStatus, { color: colors.text }]}>
                    {attendanceStatusLabel(colors.label, t)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </>
  );
}
