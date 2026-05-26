import { useContext } from "react";
import { AuthContext } from "../../src/context/authContext";
import { NotificationsList } from "../../components/notifications/NotificationsList";
import { useNotifications } from "../../hooks/useNotifications";

export default function TeacherNotifications() {
  const { user } = useContext(AuthContext);
  const { notifications, loading, markRead, markAllRead } = useNotifications(
    user?.uid,
  );

  return (
    <NotificationsList
      audience="teacher"
      notifications={notifications}
      loading={loading}
      onMarkRead={markRead}
      onMarkAllRead={markAllRead}
    />
  );
}
