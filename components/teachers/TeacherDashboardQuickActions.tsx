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
      >
        {pendingAbsenceCount > 0 ? (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{pendingAbsenceCount}</Text>
          </View>
        ) : null}
        <Text style={styles.actionEmoji}>📝</Text>
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
      >
        <Text style={styles.actionEmoji}>📚</Text>
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
      >
        <Text style={styles.actionEmoji}>⭐</Text>
        <Text style={styles.actionTitle}>
          {t("teacher.dashboard.remarks")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
