import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

export function TeacherDashboardBanners() {
  const { t } = useTranslation();

  return (
    <>
      <TouchableOpacity
        style={styles.gradesBanner}
        onPress={() => router.push("/(teachers)/exam-reports")}
        activeOpacity={0.85}
      >
        <View style={styles.gradesBannerIcon}>
          <Text style={styles.gradesBannerEmoji}>📊</Text>
        </View>
        <View style={styles.gradesBannerText}>
          <Text style={styles.gradesBannerTitle}>
            {t("teacher.dashboard.examGradesTitle")}
          </Text>
          <Text style={styles.gradesBannerSub}>
            {t("teacher.dashboard.examGradesSub")}
          </Text>
        </View>
        <Text style={styles.gradesBannerChevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.absenceBanner}
        onPress={() => router.push("/(teachers)/absence-reports")}
        activeOpacity={0.85}
      >
        <View style={styles.absenceBannerIcon}>
          <Text style={styles.absenceBannerEmoji}>🏥</Text>
        </View>
        <View style={styles.absenceBannerText}>
          <Text style={styles.absenceBannerTitle}>
            {t("teacher.dashboard.absenceReportsTitle")}
          </Text>
          <Text style={styles.absenceBannerSub}>
            {t("teacher.dashboard.absenceReportsSub")}
          </Text>
        </View>
        <Text style={styles.absenceBannerChevron}>›</Text>
      </TouchableOpacity>
    </>
  );
}
