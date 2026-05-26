import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardStatsProps = {
  classCount: number;
  studentCount: number;
};

export function TeacherDashboardStats({
  classCount,
  studentCount,
}: TeacherDashboardStatsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.statsContainer}>
      <View style={[styles.statCard, { backgroundColor: "#DBEAFE" }]}>
        <Text style={styles.statValue}>{classCount}</Text>
        <Text style={styles.statLabel}>{t("teacher.dashboard.classes")}</Text>
      </View>

      <View style={[styles.statCard, { backgroundColor: "#DCFCE7" }]}>
        <Text style={styles.statValue}>{studentCount}</Text>
        <Text style={styles.statLabel}>{t("teacher.dashboard.students")}</Text>
      </View>
    </View>
  );
}
