import { useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { NotificationsList } from "../../components/notifications/NotificationsList";
import { ParentScreenShell } from "../../components/parent/ParentScreenShell";
import { useNotifications } from "../../hooks/useNotifications";

export default function ParentNotifications() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { notifications, loading, markRead, markAllRead, remove } =
    useNotifications(user?.uid);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <ParentScreenShell
      title={t("notifications.title")}
      showBack
      showNotifications={false}
      scroll={false}
      headerRight={
        unreadCount > 0 ? (
          <TouchableOpacity
            onPress={markAllRead}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#1D4ED8" }}>
              {t("notifications.markRead")}
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      <NotificationsList
        audience="parent"
        notifications={notifications}
        loading={loading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDelete={remove}
        embedded
      />
    </ParentScreenShell>
  );
}
