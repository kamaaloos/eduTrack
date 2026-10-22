import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { webTeacherQuickActionsStyle } from "../../src/constants/platformLayout";
import { AdminWebShortcutTile } from "../admin/web/AdminWebShortcutTile";
import { teacherDashboardStyles as styles } from "./teacherDashboardStyles";

type TeacherDashboardQuickActionsProps = {
  pendingAbsenceCount: number;
};

export function TeacherDashboardQuickActions({
  pendingAbsenceCount,
}: TeacherDashboardQuickActionsProps) {
  const { t } = useTranslation();
  const layout = usePlatformLayout();

  return (
    <View style={[styles.actionsContainer, webTeacherQuickActionsStyle(layout)]}>
      <View style={styles.actionTileWrap}>
        <AdminWebShortcutTile
          label={t("teacher.dashboard.attendance")}
          icon="calendar-outline"
          onPress={() => router.push("/(teachers)/attendance")}
          rowIndex={0}
          subtitle={
            pendingAbsenceCount > 0
              ? t("teacher.dashboard.awaitingParent")
              : undefined
          }
        />
        {pendingAbsenceCount > 0 ? (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{pendingAbsenceCount}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actionTileWrap}>
        <AdminWebShortcutTile
          label={t("teacher.dashboard.academic")}
          icon="book-outline"
          onPress={() => router.push("/(teachers)/academic")}
          rowIndex={1}
        />
      </View>

      <View style={styles.actionTileWrap}>
        <AdminWebShortcutTile
          label={t("teacher.dashboard.remarks")}
          icon="chatbox-ellipses-outline"
          onPress={() =>
            router.push({
              pathname: "/(teachers)/academic",
              params: { tab: "remarks" },
            })
          }
          rowIndex={2}
        />
      </View>
    </View>
  );
}
