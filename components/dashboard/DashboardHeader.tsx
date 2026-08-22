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
import { CurrentTermBadge } from "../common/CurrentTermBadge";
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

  const showMenuButton =
    Boolean(onMenuPress) && !(layout.isDesktopWeb && hideMenuOnDesktopWeb);

  const iconBtnStyle =
    Platform.OS === "web"
      ? styles.headerIconButton
      : styles.headerIconButtonNative;
  const iconColor = Platform.OS === "web" ? "#1E3A8A" : "#FFFFFF";

  const headerInner = (
    <View
      style={[
        styles.headerInner,
        webAdminContentStyle(),
        webAdminPagePaddingStyle(),
      ]}
    >
      <View style={styles.headerRow}>
        <UserAvatar
          name={displayName}
          photoURL={photoURL}
          size={Platform.OS === "web" ? 48 : 52}
          textColor="#1E3A8A"
          backgroundColor="#FFFFFF"
        />

        <View style={styles.headerTextBlock}>
          <TimeGreeting textStyle={styles.greeting} iconColor="#BFDBFE" />
          <Text style={styles.name} numberOfLines={2}>
            {firstName}
          </Text>
          {headerSubtitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {headerSubtitle}
            </Text>
          ) : null}
          <CurrentTermBadge variant="header" />
        </View>

        <View style={styles.headerActions}>
          {showMenuButton ? (
            <TouchableOpacity
              style={iconBtnStyle}
              onPress={onMenuPress}
              accessibilityLabel={t("admin.management")}
            >
              <Ionicons name="menu" size={20} color={iconColor} />
            </TouchableOpacity>
          ) : null}

          {showHealthCheck && onHealthCheckPress ? (
            <TouchableOpacity
              style={iconBtnStyle}
              onPress={onHealthCheckPress}
              accessibilityLabel={t("parent.reportAbsenceTitle")}
            >
              <Ionicons name="medkit" size={20} color={iconColor} />
            </TouchableOpacity>
          ) : null}

          {showNotifications ? (
            <TouchableOpacity
              style={iconBtnStyle}
              onPress={() => router.push(notificationRoute as never)}
              accessibilityLabel={t("common.alerts")}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={iconColor}
              />
              {notificationUnreadCount > 0 ? (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>
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
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.headerSafe} edges={["top"]}>
      <View
        style={[
          styles.header,
          Platform.OS !== "web" ? { paddingTop: 4 } : null,
        ]}
      >
        {headerInner}
      </View>
    </SafeAreaView>
  );
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
