import { useContext, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { NotificationsList } from "../../components/notifications/NotificationsList";
import { useNotifications } from "../../hooks/useNotifications";
import { useAdminData } from "../../src/context/adminDataContext";
import { AuthContext } from "../../src/context/authContext";
import type { AppNotification } from "../../src/services/notifications";
import {
  isPasswordResetNotification,
  resolvePasswordResetDirectoryTarget,
} from "../../src/utils/adminPasswordResetNavigation";
import { showErrorAlert } from "../../src/utils/confirmDialog";

export default function AdminNotifications() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { students, teachers, parents, refreshAll } = useAdminData();
  const { notifications, loading, markRead, markAllRead, remove } =
    useNotifications(user?.uid);

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  const handlePressItem = (item: AppNotification) => {
    if (!isPasswordResetNotification(item)) return;

    const target = resolvePasswordResetDirectoryTarget(item, {
      students,
      teachers,
      parents,
    });

    if (!target) {
      showErrorAlert(
        t("common.error"),
        t("admin.passwordResetUserNotFound"),
      );
      return;
    }

    router.push({
      pathname: "/(admin)/user-directory/[role]",
      params: {
        role: target.role,
        userId: target.userId,
        openPassword: "1",
      },
    });
  };

  return (
    <AdminScreenShell title={t("admin.notificationsTitle")} showBack>
      <NotificationsList
        audience="admin"
        notifications={notifications}
        loading={loading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDelete={remove}
        onPressItem={handlePressItem}
      />
    </AdminScreenShell>
  );
}
