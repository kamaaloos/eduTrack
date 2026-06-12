import { useContext } from "react";
import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { NotificationsList } from "../../components/notifications/NotificationsList";
import { TeacherScreenShell } from "../../components/teachers/TeacherScreenShell";
import { useNotifications } from "../../hooks/useNotifications";

export default function TeacherNotifications() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { notifications, loading, markRead, markAllRead, remove } =
    useNotifications(user?.uid);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <TeacherScreenShell
      title={t("notifications.title")}
      showBack
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
        audience="teacher"
        notifications={notifications}
        loading={loading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        onDelete={remove}
        embedded
      />
    </TeacherScreenShell>
  );
}
