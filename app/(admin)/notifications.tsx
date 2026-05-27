import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { AdminScreenHeader } from "../../components/admin/AdminScreenHeader";
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
    <View style={styles.screen}>
      <AdminScreenHeader
        title={t("admin.notificationsTitle")}
        showBack
        showLogout={false}
      />
      <NotificationsList
        audience="admin"
        notifications={notifications}
        loading={loading}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});
