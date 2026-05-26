import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import type { TeacherAttendanceRecord } from "../../../src/services/teacherAttendanceResponses";
import { StudentAttendanceCard } from "./StudentAttendanceCard";
import { teacherAttendanceStyles as styles } from "./teacherAttendanceStyles";
import type { StudentRow } from "./teacherAttendanceTypes";

type TeacherAttendanceStudentSectionProps = {
  classId: string;
  students: StudentRow[];
  selectedStudent: StudentRow | null;
  selectedIndex: number;
  sortedStudentCount: number;
  todayRecord?: TeacherAttendanceRecord;
  onOpenPicker: () => void;
  onPrevStudent: () => void;
  onNextStudent: () => void;
  onMark: (status: "present" | "absent" | "late") => void;
};

export function TeacherAttendanceStudentSection({
  classId,
  students,
  selectedStudent,
  selectedIndex,
  sortedStudentCount,
  todayRecord,
  onOpenPicker,
  onPrevStudent,
  onNextStudent,
  onMark,
}: TeacherAttendanceStudentSectionProps) {
  const { t } = useTranslation();

  if (!classId) return null;

  if (students.length === 0) {
    return (
      <Text style={styles.warning}>{t("teacher.attendance.noStudents")}</Text>
    );
  }

  return (
    <>
      <Text style={styles.sub}>{t("teacher.attendance.selectStudent")}</Text>
      <Pressable style={styles.pickerTrigger} onPress={onOpenPicker}>
        <View style={styles.pickerTriggerInner}>
          <Ionicons name="person" size={22} color="#1E40AF" />
          <Text style={styles.pickerTriggerText} numberOfLines={1}>
            {selectedStudent
              ? selectedStudent.name ||
                selectedStudent.email ||
                t("common.student")
              : t("teacher.attendance.chooseStudent")}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={22} color="#64748B" />
      </Pressable>

      <Text style={styles.studentCount}>
        {students.length} {t("teacher.attendance.studentsInClass")}
      </Text>

      {selectedStudent ? (
        <>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={onPrevStudent}>
              <Ionicons name="chevron-back" size={20} color="#1E40AF" />
              <Text style={styles.navBtnText}>
                {t("teacher.attendance.previous")}
              </Text>
            </TouchableOpacity>
            <Text style={styles.navCounter}>
              {selectedIndex + 1} / {sortedStudentCount}
            </Text>
            <TouchableOpacity style={styles.navBtn} onPress={onNextStudent}>
              <Text style={styles.navBtnText}>
                {t("teacher.attendance.next")}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#1E40AF" />
            </TouchableOpacity>
          </View>

          <StudentAttendanceCard
            student={selectedStudent}
            todayRecord={todayRecord}
            onMark={onMark}
          />
        </>
      ) : null}
    </>
  );
}
