import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import {
  mobileScreenPaddingStyle,
  webAdminContentStyle,
  webAdminPagePaddingStyle,
} from "../../src/constants/webLayout";
import { platformShadow } from "../../src/utils/platformShadow";
import { CurrentTermBadge } from "../common/CurrentTermBadge";

type StudentScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  /** Hide hamburger on desktop web when a persistent sidebar is shown (teacher/parent). */
  hideMenuOnDesktopWeb?: boolean;
  notificationCount?: number;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
  headerRight?: React.ReactNode;
  showCurrentTerm?: boolean;
};

export function StudentScreenHeader({
  title,
  subtitle,
  showBack = false,
  showMenu = true,
  hideMenuOnDesktopWeb = true,
  notificationCount = 0,
  onNotificationsPress,
  onMenuPress,
  headerRight,
  showCurrentTerm = false,
}: StudentScreenHeaderProps) {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const showMenuButton =
    showMenu &&
    Boolean(onMenuPress) &&
    !(layout.isDesktopWeb && hideMenuOnDesktopWeb);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View
          style={[
            styles.headerInner,
            webAdminContentStyle(),
            webAdminPagePaddingStyle(),
            mobileScreenPaddingStyle(),
          ]}
        >
          <View style={styles.row}>
            {showBack ? (
              <TouchableOpacity
                style={styles.sideButton}
                onPress={() => router.back()}
                accessibilityLabel={t("admin.goBackA11y")}
              >
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            ) : (
              <View style={styles.brandBadge}>
                <Ionicons name="school" size={22} color="#1E3A8A" />
              </View>
            )}

            <View style={styles.titleBlock}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {subtitle}
                </Text>
              ) : null}
              {showCurrentTerm ? <CurrentTermBadge variant="header" /> : null}
            </View>

            <View style={styles.headerActions}>
              {headerRight}
              {onNotificationsPress ? (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onNotificationsPress}
                  accessibilityLabel={t("notifications.title")}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color="#1E3A8A"
                  />
                  {notificationCount > 0 ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ) : null}

              {showMenuButton ? (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={onMenuPress}
                  accessibilityLabel={t("admin.management")}
                >
                  <Ionicons name="menu" size={20} color="#1E3A8A" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#1E3A8A",
  },
  header: {
    backgroundColor: "#1E3A8A",
    paddingTop: Platform.OS === "web" ? 12 : 0,
    paddingBottom: Platform.OS === "web" ? 18 : 18,
    borderBottomLeftRadius: Platform.OS === "web" ? 0 : 24,
    borderBottomRightRadius: Platform.OS === "web" ? 0 : 24,
    ...platformShadow("lg"),
    ...(Platform.OS === "web"
      ? { borderBottomWidth: 1, borderBottomColor: "#1E3A8A" }
      : null),
  },
  headerInner: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: Platform.OS === "web" ? 72 : 52,
  },
  sideButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
  titleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: Platform.OS === "web" ? 18 : 20,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "#BFDBFE",
    fontSize: 13,
    lineHeight: 18,
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
