import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwipeToDeleteRow } from "../common/SwipeToDeleteRow";
import { STUDENT_LIST_MAX_WIDTH } from "../students/studentScreenStyles";
import {
  INNER_CARD_BORDER_GREEN,
  INNER_CARD_BORDER_RED,
} from "../../src/constants/innerCardBorders";
import {
  type AppNotification,
} from "../../src/services/notifications";
import { getLocalizedNotificationDisplay } from "../../src/utils/notificationDisplay";

type NotificationAudience = "teacher" | "student" | "parent" | "admin";

type NotificationsListProps = {
  audience: NotificationAudience;
  notifications: AppNotification[];
  loading?: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Hide built-in header when wrapped in a screen shell. */
  embedded?: boolean;
  onPressItem?: (item: AppNotification) => void;
};

const EMPTY_MESSAGE_KEYS: Record<NotificationAudience, string> = {
  teacher: "notifications.emptyTeacher",
  student: "notifications.emptyStudent",
  parent: "notifications.emptyParent",
  admin: "notifications.emptyAdmin",
};

function formatWhen(date: Date | null): string {
  if (!date) return "";
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function NotificationsList({
  audience,
  notifications,
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onRefresh,
  refreshing = false,
  embedded = false,
  onPressItem,
}: NotificationsListProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const title = t("notifications.title");
  const emptyMessage = t(EMPTY_MESSAGE_KEYS[audience]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.screen, embedded && styles.screenEmbedded]}>
      {!embedded ? (
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text style={styles.title}>{title}</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity style={styles.markAllBtn} onPress={onMarkAllRead}>
              <Text style={styles.markAllText}>{t("notifications.markRead")}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {loading && notifications.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            embedded ? styles.listEmbedded : null,
            { paddingBottom: insets.bottom + (embedded ? 32 : 120) },
          ]}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
          showsVerticalScrollIndicator={false}
        >
          {notifications.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyMessage}>{emptyMessage}</Text>
            </View>
          ) : (
            notifications.map((item) => {
              const display = getLocalizedNotificationDisplay(item, t);
              return (
              <SwipeToDeleteRow
                key={item.id}
                onDelete={() => onDelete(item.id)}
              >
                <TouchableOpacity
                  style={[styles.card, !item.read && styles.cardUnread]}
                  activeOpacity={0.85}
                  onPress={() => {
                    if (!item.read) onMarkRead(item.id);
                    onPressItem?.(item);
                  }}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.typePill}>
                      <Text style={styles.typePillText}>
                        {display.typeLabel}
                      </Text>
                    </View>
                    <View style={styles.cardTopRight}>
                      {!item.read ? <View style={styles.unreadDot} /> : null}
                      {Platform.OS === "web" ? (
                        <TouchableOpacity
                          style={styles.dismissBtn}
                          onPress={(event) => {
                            event.stopPropagation?.();
                            onDelete(item.id);
                          }}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          accessibilityRole="button"
                          accessibilityLabel={t("notifications.dismiss")}
                        >
                          <Ionicons
                            name="close-circle-outline"
                            size={22}
                            color="#94A3B8"
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                  <Text style={styles.cardTitle}>{display.title}</Text>
                  <Text style={styles.cardMessage}>{display.message}</Text>
                  {item.type === "password_reset_request" && onPressItem ? (
                    <View style={styles.cardActionRow}>
                      <Text style={styles.cardActionText}>
                        {t("notifications.openUserDirectory")}
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color="#2563EB" />
                    </View>
                  ) : null}
                  {item.createdAt ? (
                    <Text style={styles.cardTime}>
                      {formatWhen(item.createdAt)}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              </SwipeToDeleteRow>
            );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  screenEmbedded: { width: "100%" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    alignItems: "center",
  },
  listEmbedded: {
    paddingHorizontal: 0,
    paddingTop: 0,
    alignItems: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  emptyMessage: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    width: "100%",
    maxWidth: STUDENT_LIST_MAX_WIDTH,
    alignSelf: "center",
  },
  cardUnread: {
    borderColor: INNER_CARD_BORDER_RED,
    backgroundColor: "#FFFFFF",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dismissBtn: {
    padding: 2,
  },
  typePill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  cardMessage: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  cardActionRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },
  cardTime: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },
});
