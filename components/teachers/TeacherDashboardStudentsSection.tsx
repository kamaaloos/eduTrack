import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardStudentsSectionProps = {
  selectedClassId: string;
  selectedClassLabel: string;
  filteredStudents: any[];
};

export function TeacherDashboardStudentsSection({
  selectedClassId,
  selectedClassLabel,
  filteredStudents,
}: TeacherDashboardStudentsSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {t("teacher.dashboard.studentsSection")}
          {selectedClassLabel ? ` · ${selectedClassLabel}` : ""}
        </Text>
        {selectedClassId ? (
          <Text style={styles.sectionHint}>
            {filteredStudents.length} {t("teacher.dashboard.students")}
          </Text>
        ) : null}
      </View>

      {!selectedClassId ? (
        <Text style={styles.emptyHint}>
          {t("teacher.dashboard.selectClassHint")}
        </Text>
      ) : filteredStudents.length === 0 ? (
        <Text style={styles.emptyHint}>
          {t("teacher.dashboard.noStudentsInClass")}
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filteredStudents.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.studentCard}
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/(teachers)/student-report/[studentId]",
                  params: {
                    studentId: item.id,
                    name: item.name || t("common.student"),
                    classId: item.classId || selectedClassId,
                  },
                })
              }
            >
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {item.name?.charAt(0) || "?"}
                </Text>
              </View>

              <Text style={styles.studentName} numberOfLines={2}>
                {item.name || t("common.student")}
              </Text>

              <Text style={styles.studentReportHint}>
                {t("teacher.dashboard.viewReport")}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
