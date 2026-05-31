import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AdminScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  notificationCount?: number;
  onNotificationsPress?: () => void;
  onMenuPress?: () => void;
};

export const AdminScreenHeader: React.FC<AdminScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  notificationCount = 0,
  onNotificationsPress,
  onMenuPress,
}) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
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
          </View>

          <View style={styles.headerActions}>
            {onNotificationsPress ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onNotificationsPress}
                accessibilityLabel={t("admin.notificationsTitle")}
              >
                <Ionicons name="notifications-outline" size={20} color="#1E3A8A" />
                {notificationCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ) : null}

            {onMenuPress ? (
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#1E3A8A",
  },
  header: {
    backgroundColor: "#1E3A8A",
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
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
    fontSize: 20,
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
