import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import {
  INNER_CARD_BORDER_GREEN,
  INNER_CARD_BORDER_RED,
} from "../../src/constants/innerCardBorders";
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
      <View
        style={[
          styles.statCard,
          { backgroundColor: "#DBEAFE", borderColor: INNER_CARD_BORDER_RED },
        ]}
      >
        <Text style={styles.statValue}>{classCount}</Text>
        <Text style={styles.statLabel}>{t("teacher.dashboard.classes")}</Text>
      </View>

      <View
        style={[
          styles.statCard,
          { backgroundColor: "#DCFCE7", borderColor: INNER_CARD_BORDER_GREEN },
        ]}
      >
        <Text style={styles.statValue}>{studentCount}</Text>
        <Text style={styles.statLabel}>{t("teacher.dashboard.students")}</Text>
      </View>
    </View>
  );
}
