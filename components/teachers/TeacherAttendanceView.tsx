import { RefreshControl, ScrollView, View } from "react-native";
import { StudentPickerModal } from "./attendance/StudentPickerModal";
import { TeacherAttendanceHeader } from "./attendance/TeacherAttendanceHeader";
import { TeacherAttendanceStudentSection } from "./attendance/TeacherAttendanceStudentSection";
import { TeacherAttendanceSummarySections } from "./attendance/TeacherAttendanceSummarySections";
import { teacherAttendanceStyles as styles } from "./attendance/teacherAttendanceStyles";
import type { useTeacherAttendance } from "../../hooks/useTeacherAttendance";

export type TeacherAttendanceViewProps = ReturnType<typeof useTeacherAttendance>;

export function TeacherAttendanceView({
  classes,
  classId,
  setClassId,
  students,
  selectedStudent,
  selectedStudentId,
  selectedIndex,
  sortedStudents,
  filteredPickerStudents,
  pickerOpen,
  setPickerOpen,
  studentSearch,
  setStudentSearch,
  todayByStudent,
  recentAbsents,
  pendingToday,
  excusedToday,
  studentNameById,
  refreshing,
  onRefresh,
  markAttendance,
  selectStudent,
  goPrevStudent,
  goNextStudent,
}: TeacherAttendanceViewProps) {
  return (
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
        <TeacherAttendanceStudentSection
          classId={classId}
          students={students}
          selectedStudent={selectedStudent}
          selectedIndex={selectedIndex}
          sortedStudentCount={sortedStudents.length}
          todayRecord={
            selectedStudent ? todayByStudent[selectedStudent.id] : undefined
          }
          onOpenPicker={() => setPickerOpen(true)}
          onPrevStudent={goPrevStudent}
          onNextStudent={goNextStudent}
          onMark={(status) =>
            selectedStudent && markAttendance(selectedStudent.id, status)
          }
        />

        <TeacherAttendanceSummarySections
          classId={classId}
          pendingToday={pendingToday}
          excusedToday={excusedToday}
          recentAbsents={recentAbsents}
          studentNameById={studentNameById}
          onSelectStudent={selectStudent}
        />
      </ScrollView>

      <StudentPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        studentSearch={studentSearch}
        onStudentSearchChange={setStudentSearch}
        filteredStudents={filteredPickerStudents}
        selectedStudentId={selectedStudentId}
        todayByStudent={todayByStudent}
        onSelectStudent={selectStudent}
      />
    </View>
  );
}
