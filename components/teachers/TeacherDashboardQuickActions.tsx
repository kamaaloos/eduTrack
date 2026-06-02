import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardQuickActionsProps = {
  pendingAbsenceCount: number;
};

export function TeacherDashboardQuickActions({
  pendingAbsenceCount,
}: TeacherDashboardQuickActionsProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push("/(teachers)/attendance")}
        activeOpacity={0.85}
      >
        {pendingAbsenceCount > 0 ? (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{pendingAbsenceCount}</Text>
          </View>
        ) : null}
        <View style={styles.actionIconWrap}>
          <Ionicons name="calendar-outline" size={22} color="#1E3A8A" />
        </View>
        <Text style={styles.actionTitle}>
          {t("teacher.dashboard.attendance")}
        </Text>
        {pendingAbsenceCount > 0 ? (
          <Text style={styles.actionHint}>
            {t("teacher.dashboard.awaitingParent")}
          </Text>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push("/(teachers)/academic")}
        activeOpacity={0.85}
      >
        <View style={styles.actionIconWrap}>
          <Ionicons name="book-outline" size={22} color="#1E3A8A" />
        </View>
        <Text style={styles.actionTitle}>
          {t("teacher.dashboard.academic")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() =>
          router.push({
            pathname: "/(teachers)/academic",
            params: { tab: "remarks" },
          })
        }
        activeOpacity={0.85}
      >
        <View style={styles.actionIconWrap}>
          <Ionicons name="chatbox-ellipses-outline" size={22} color="#1E3A8A" />
        </View>
        <Text style={styles.actionTitle}>
          {t("teacher.dashboard.remarks")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
