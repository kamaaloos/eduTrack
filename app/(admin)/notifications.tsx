import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { NotificationsList } from "../../components/notifications/NotificationsList";
import { useNotifications } from "../../hooks/useNotifications";
import { AuthContext } from "../../src/context/authContext";

export default function AdminNotifications() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { notifications, loading, markRead, markAllRead } = useNotifications(
    user?.uid,
  );

  return (
    <AdminScreenShell title={t("admin.notificationsTitle")} showBack>
      <NotificationsList
        audience="admin"
        notifications={notifications}
        loading={loading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </AdminScreenShell>
  );
}
