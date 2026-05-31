import { router } from "expo-router";
import React, { useContext, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { AuthContext } from "../../src/context/authContext";
import { useParentMenu } from "../../src/context/parentMenuContext";
import { APP_SCREEN_BACKGROUND } from "../../src/constants/appTheme";

type ParentScreenShellProps = {
  title: string;
  subtitle?: string;
  showNotifications?: boolean;
  children: ReactNode;
};

export function ParentScreenShell({
  title,
  subtitle,
  showNotifications = true,
  children,
}: ParentScreenShellProps) {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const { openMenu } = useParentMenu();
  const notificationCount = useUnreadNotificationCount(
    showNotifications ? user?.uid : null,
  );

  const displayTitle =
    title ||
    t("parent.homeGreeting", {
      name: userData?.name || t("common.parent"),
    });

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.header} edges={["top"]}>
        <View style={styles.headerRow}>
          <View style={styles.brandBadge}>
            <Ionicons name="people" size={22} color="#1E3A8A" />
          </View>

          <View style={styles.headerTextBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {displayTitle}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={styles.headerActions}>
            {showNotifications ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/(parent)/notifications")}
                accessibilityLabel={t("tabs.parent.alerts")}
              >
                <Ionicons name="notifications-outline" size={20} color="#1E3A8A" />
                {notificationCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.iconButton}
              onPress={openMenu}
              accessibilityLabel={t("admin.management")}
            >
              <Ionicons name="menu" size={22} color="#1E3A8A" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_SCREEN_BACKGROUND,
  },
  header: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: "#BFDBFE",
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
});
