import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { UserAvatar } from "../common/UserAvatar";
import { TimeGreeting } from "./TimeGreeting";
import { dashboardStyles as styles } from "./dashboardStyles";

type DashboardHeaderProps = {
  initials: string;
  displayName?: string;
  photoURL?: string | null;
  firstName: string;
  headerSubtitle?: string;
  showNotifications: boolean;
  showHeaderLogout: boolean;
  showHealthCheck: boolean;
  onHealthCheckPress?: () => void;
  notificationRoute: string;
  notificationUnreadCount: number;
  onLogout: () => void;
  onMenuPress?: () => void;
};

export function DashboardHeader({
  initials,
  displayName,
  photoURL,
  firstName,
  headerSubtitle,
  showNotifications,
  showHeaderLogout,
  showHealthCheck,
  onHealthCheckPress,
  notificationRoute,
  notificationUnreadCount,
  onLogout,
  onMenuPress,
}: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.headerGradient}>
      <View style={styles.headerContent}>
        <UserAvatar
          name={displayName}
          photoURL={photoURL}
          size={60}
          textColor="#1E40AF"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.headerText}>
          <TimeGreeting textStyle={styles.welcome} />
          <Text style={styles.name}>{firstName}</Text>
          {headerSubtitle ? (
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          ) : null}
        </View>

        {showHealthCheck && onHealthCheckPress ? (
          <View style={styles.headerActions}>
            {onMenuPress ? (
              <TouchableOpacity
                onPress={onMenuPress}
                style={styles.alertButton}
                accessibilityLabel={t("admin.management")}
              >
                <Ionicons name="menu" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={onHealthCheckPress}
              style={styles.alertButton}
              accessibilityLabel={t("parent.reportAbsenceTitle")}
            >
              <Ionicons name="medkit" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerActions}>
            {onMenuPress ? (
              <TouchableOpacity
                onPress={onMenuPress}
                style={styles.alertButton}
                accessibilityLabel={t("admin.management")}
              >
                <Ionicons name="menu" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null}
            {showNotifications ? (
              <TouchableOpacity
                onPress={() => router.push(notificationRoute as never)}
                style={styles.alertButton}
                accessibilityLabel={t("notifications.title")}
              >
                <Ionicons name="notifications" size={24} color="#FFFFFF" />
                {notificationUnreadCount > 0 ? (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationUnreadCount > 9
                        ? "9+"
                        : notificationUnreadCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : null}
            {showHeaderLogout ? (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={onLogout}
                accessibilityLabel={t("common.logout")}
              >
                <Ionicons name="log-out-outline" size={18} color="#1E40AF" />
                <Text style={styles.logoutText}>{t("common.logout")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

export function useDashboardLogout(onLogout: () => Promise<void>) {
  const { t } = useTranslation();

  return () => {
    Alert.alert(t("profile.signOutTitle"), t("profile.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await onLogout();
          } catch (err) {
            Alert.alert(
              t("common.error"),
              err instanceof Error
                ? err.message
                : t("common.somethingWentWrong"),
            );
          }
        },
      },
    ]);
  };
}
