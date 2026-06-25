import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import {
  webAdminContentStyle,
  webAdminPagePaddingStyle,
} from "../../src/constants/webLayout";
import {
  confirmDestructiveAction,
  showErrorAlert,
} from "../../src/utils/confirmDialog";
import { UserAvatar } from "../common/UserAvatar";
import { TimeGreeting } from "./TimeGreeting";
import { dashboardStyles as styles } from "./dashboardStyles";

type DashboardHeaderProps = {
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
  /** Hide hamburger on desktop web when persistent sidebar is shown. */
  hideMenuOnDesktopWeb?: boolean;
};

export function DashboardHeader({
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
  hideMenuOnDesktopWeb = true,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const layout = usePlatformLayout();

  const iconButtonStyle =
    Platform.OS === "web" ? styles.headerIconButton : styles.alertButton;

  const showMenuButton =
    Boolean(onMenuPress) &&
    !(layout.isDesktopWeb && hideMenuOnDesktopWeb);

  const menuButton = showMenuButton ? (
    <TouchableOpacity
      onPress={onMenuPress}
      style={iconButtonStyle}
      accessibilityLabel={t("admin.management")}
    >
      <Ionicons
        name="menu"
        size={Platform.OS === "web" ? 20 : 24}
        color={Platform.OS === "web" ? "#1E3A8A" : "#FFFFFF"}
      />
    </TouchableOpacity>
  ) : null;

  const headerInner = (
    <View style={styles.headerContent}>
      <UserAvatar
        name={displayName}
        photoURL={photoURL}
        size={Platform.OS === "web" ? 48 : 60}
        textColor="#1E3A8A"
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
          {menuButton}
          <TouchableOpacity
            onPress={onHealthCheckPress}
            style={iconButtonStyle}
            accessibilityLabel={t("parent.reportAbsenceTitle")}
          >
            <Ionicons
              name="medkit"
              size={Platform.OS === "web" ? 20 : 24}
              color={Platform.OS === "web" ? "#1E3A8A" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerActions}>
          {menuButton}
          {showNotifications ? (
            <TouchableOpacity
              onPress={() => router.push(notificationRoute as never)}
              style={iconButtonStyle}
              accessibilityLabel={t("notifications.title")}
            >
              <Ionicons
                name="notifications-outline"
                size={Platform.OS === "web" ? 20 : 24}
                color={Platform.OS === "web" ? "#1E3A8A" : "#FFFFFF"}
              />
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
              <Ionicons name="log-out-outline" size={18} color="#1E3A8A" />
              <Text style={styles.logoutText}>{t("common.logout")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={styles.headerSafe} edges={["top"]}>
        <View style={styles.headerGradient}>
          <View
            style={[
              styles.headerInnerWrap,
              webAdminContentStyle(),
              webAdminPagePaddingStyle(),
            ]}
          >
            {headerInner}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return <View style={styles.headerGradient}>{headerInner}</View>;
}

export function useDashboardLogout(onLogout: () => Promise<void>) {
  const { t } = useTranslation();

  return () => {
    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("profile.signOutTitle"),
        t("profile.signOutConfirm"),
        t("common.logout"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await onLogout();
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("common.somethingWentWrong"),
        );
      }
    })();
  };
}
