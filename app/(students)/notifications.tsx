import { useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { NotificationsList } from "../../components/notifications/NotificationsList";
import { StudentScreenShell } from "../../components/students/StudentScreenShell";
import { useNotifications } from "../../hooks/useNotifications";

export default function StudentNotifications() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { notifications, loading, markRead, markAllRead } = useNotifications(
    user?.uid,
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <StudentScreenShell
      title={t("notifications.title")}
      showBack
      showMenu={false}
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
        audience="student"
        notifications={notifications}
        loading={loading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        embedded
      />
    </StudentScreenShell>
  );
}
