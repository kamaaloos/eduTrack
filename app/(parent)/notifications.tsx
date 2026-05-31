import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { NotificationsList } from "../../components/notifications/NotificationsList";
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";
import { useNotifications } from "../../hooks/useNotifications";

export default function ParentNotifications() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { notifications, loading, markRead, markAllRead } = useNotifications(
    user?.uid,
  );

  return (
    <ParentScreenShell
      title={t("tabs.parent.alerts")}
      showNotifications={false}
    >
      <NotificationsList
        audience="parent"
        notifications={notifications}
        loading={loading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </ParentScreenShell>
  );
}
