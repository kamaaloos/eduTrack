import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SuperAdminScreenShell } from "../../components/superAdmin/SuperAdminScreenShell";
import { INNER_CARD_BORDER_GREEN, INNER_CARD_BORDER_RED } from "../../../src/constants/innerCardBorders";
import {
  deleteContactInquiry,
  listContactInquiries,
  type ContactInquiry,
} from "../../src/services/contactInquiry";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";

function formatInquiryDate(value: Date | null): string {
  if (!value) return "—";
  return value.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SuperAdminContactInquiriesScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await listContactInquiries();
      setItems(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("superAdmin.contactLoadFailed"),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const replyByEmail = async (item: ContactInquiry) => {
    const url = `mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(
      t("superAdmin.contactReplySubject"),
    )}`;
    try {
      await Linking.openURL(url);
    } catch {
      showErrorAlert(t("common.error"), t("superAdmin.contactReplyFailed"));
    }
  };

  const confirmDelete = (item: ContactInquiry) => {
    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("superAdmin.contactDeleteTitle"),
        t("superAdmin.contactDeleteMessage", { name: item.name }),
        t("common.delete"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      setBusyId(item.id);
      try {
        await deleteContactInquiry(item.id);
        setItems((prev) => prev.filter((row) => row.id !== item.id));
        showSuccessAlert(t("common.success"), t("superAdmin.contactDeleted"));
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("superAdmin.contactDeleteFailed"),
        );
      } finally {
        setBusyId(null);
      }
    })();
  };

  const renderItem = ({ item }: { item: ContactInquiry }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardMeta}>{formatInquiryDate(item.createdAt)}</Text>
        </View>
        {busyId === item.id ? (
          <ActivityIndicator size="small" color="#1E3A8A" />
        ) : null}
      </View>

      <Text style={styles.cardLine}>
        <Text style={styles.cardLabel}>{t("contact.email")}: </Text>
        {item.email}
      </Text>
      {item.schoolName ? (
        <Text style={styles.cardLine}>
          <Text style={styles.cardLabel}>{t("contact.schoolName")}: </Text>
          {item.schoolName}
        </Text>
      ) : null}
      <Text style={styles.message}>{item.message}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.replyBtn}
          onPress={() => void replyByEmail(item)}
        >
          <Ionicons name="mail-outline" size={16} color="#FFFFFF" />
          <Text style={styles.replyBtnText}>{t("superAdmin.contactReply")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => confirmDelete(item)}
          disabled={busyId === item.id}
        >
          <Ionicons name="trash-outline" size={16} color="#B91C1C" />
          <Text style={styles.deleteBtnText}>{t("common.delete")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SuperAdminScreenShell
      title={t("superAdmin.contactTitle")}
      subtitle={t("superAdmin.contactSubtitle")}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => void load()}>
            <Text style={styles.retryBtnText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="mail-open-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>{t("superAdmin.contactEmpty")}</Text>
              <Text style={styles.emptyHint}>{t("superAdmin.contactEmptyHint")}</Text>
            </View>
          }
        />
      )}
    </SuperAdminScreenShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#1E3A8A",
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 24,
    gap: 14,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    ...(Platform.OS === "web"
      ? ({
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        } as object)
      : null),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 10,
  },
  cardTitleWrap: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  cardLine: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 6,
    lineHeight: 20,
  },
  cardLabel: {
    fontWeight: "700",
    color: "#475569",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#0F172A",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  replyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1E3A8A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  replyBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  deleteBtnText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 13,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#334155",
  },
  emptyHint: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 420,
  },
});
