import { RefreshControl, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { TeacherScreenShell } from "./TeacherScreenShell";
import { TeacherAttendanceHeader } from "./attendance/TeacherAttendanceHeader";
import { TeacherAttendanceRosterTable } from "./attendance/TeacherAttendanceRosterTable";
import { TeacherAttendanceSummarySections } from "./attendance/TeacherAttendanceSummarySections";
import { teacherAttendanceStyles as styles } from "./attendance/teacherAttendanceStyles";
import type { useTeacherAttendance } from "../../hooks/useTeacherAttendance";

export type TeacherAttendanceViewProps = ReturnType<typeof useTeacherAttendance>;

export function TeacherAttendanceView({
  classes,
  classId,
  setClassId,
  students,
  sortedStudents,
  todayByStudent,
  recentAbsents,
  pendingToday,
  excusedToday,
  studentNameById,
  refreshing,
  onRefresh,
  markAttendance,
  markClassAttendance,
  selectStudent,
}: TeacherAttendanceViewProps) {
  const { t } = useTranslation();

  return (
    <TeacherScreenShell
      title={t("teacher.attendance.title")}
      subtitle={t("teacher.attendance.selectClass")}
      showBack
      onBackPress={() => router.push("/(teachers)/dashboard")}
      scroll={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <View style={styles.container}>
        <TeacherAttendanceHeader
          classes={classes}
          classId={classId}
          onSelectClass={setClassId}
        />

        <ScrollView
          style={styles.scrollBody}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {!classId ? (
            <Text style={styles.sub}>{t("teacher.attendance.selectClass")}</Text>
          ) : students.length === 0 ? (
            <Text style={styles.warning}>
              {t("teacher.attendance.noStudents")}
            </Text>
          ) : (
            <TeacherAttendanceRosterTable
              students={sortedStudents}
              todayByStudent={todayByStudent}
              onMark={(studentId, status) =>
                void markAttendance(studentId, status, { silent: true })
              }
              onMarkAll={(status) => void markClassAttendance(status)}
            />
          )}

          <TeacherAttendanceSummarySections
            classId={classId}
            pendingToday={pendingToday}
            excusedToday={excusedToday}
            recentAbsents={recentAbsents}
            studentNameById={studentNameById}
            onSelectStudent={selectStudent}
          />
        </ScrollView>
      </View>
    </TeacherScreenShell>
  );
}
