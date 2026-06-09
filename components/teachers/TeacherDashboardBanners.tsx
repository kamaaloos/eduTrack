import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

export function TeacherDashboardBanners() {
  const { t } = useTranslation();

  return (
    <>
      <TouchableOpacity
        style={styles.linkBanner}
        onPress={() => router.push("/(teachers)/exam-reports")}
        activeOpacity={0.85}
      >
        <View style={[styles.linkBannerIcon, { backgroundColor: "#F5F3FF" }]}>
          <Ionicons name="bar-chart-outline" size={22} color="#7C3AED" />
        </View>
        <View style={styles.linkBannerText}>
          <Text style={styles.linkBannerTitle}>
            {t("teacher.dashboard.examGradesTitle")}
          </Text>
          <Text style={styles.linkBannerSub}>
            {t("teacher.dashboard.examGradesSub")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkBanner}
        onPress={() => router.push("/(teachers)/absence-reports")}
        activeOpacity={0.85}
      >
        <View style={[styles.linkBannerIcon, { backgroundColor: "#EFF6FF" }]}>
          <Ionicons name="medkit-outline" size={22} color="#1E3A8A" />
        </View>
        <View style={styles.linkBannerText}>
          <Text style={styles.linkBannerTitle}>
            {t("teacher.dashboard.absenceReportsTitle")}
          </Text>
          <Text style={styles.linkBannerSub}>
            {t("teacher.dashboard.absenceReportsSub")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
      </TouchableOpacity>
    </>
  );
}
