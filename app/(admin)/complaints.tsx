import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { AuthContext } from "../../src/context/authContext";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import {
  listParentComplaints,
  setParentComplaintStatus,
  type ParentComplaint,
  type ParentComplaintStatus,
} from "../../src/services/parentComplaints";
import { showErrorAlert, showSuccessAlert } from "../../src/utils/confirmDialog";

type ComplaintFilter = "all" | ParentComplaintStatus;

function formatWhen(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString();
}

export default function AdminComplaintsScreen() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<ParentComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ComplaintFilter>("open");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await listParentComplaints();
      setItems(data);
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.complaintsLoadFailed"),
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!q) return true;
      return (
        item.parentName.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [items, filter, search]);

  const toggleResolved = async (item: ParentComplaint) => {
    if (!user?.uid) {
      showErrorAlert(t("common.error"), t("common.sessionExpired"));
      return;
    }

    const nextStatus: ParentComplaintStatus =
      item.status === "resolved" ? "open" : "resolved";
    setSavingId(item.id);
    try {
      await setParentComplaintStatus({
        complaintId: item.id,
        status: nextStatus,
        adminId: user.uid,
      });
      setItems((prev) =>
        prev.map((current) =>
          current.id === item.id
            ? {
                ...current,
                status: nextStatus,
                resolvedAt: nextStatus === "resolved" ? new Date() : null,
                resolvedBy: nextStatus === "resolved" ? user.uid : null,
              }
            : current,
        ),
      );
      showSuccessAlert(
        t("common.success"),
        nextStatus === "resolved"
          ? t("admin.complaintMarkedResolved")
          : t("admin.complaintMarkedOpen"),
      );
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.complaintStatusUpdateFailed"),
      );
    } finally {
      setSavingId(null);
    }
  };

  const filters: { key: ComplaintFilter; label: string }[] = [
    { key: "open", label: t("admin.complaintFilterOpen") },
    { key: "resolved", label: t("admin.complaintFilterResolved") },
    { key: "all", label: t("common.all") },
  ];

  return (
    <ErrorBoundary>
      <AdminScreenShell
        title={t("admin.complaintsTitle")}
        subtitle={t("admin.complaintsSubtitle")}
        showBack
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.filterRow}>
            {filters.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.filterChip,
                  filter === item.key && styles.filterChipActive,
                ]}
                onPress={() => setFilter(item.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === item.key && styles.filterTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder={t("admin.complaintsSearch")}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />

          {loading ? (
            <ActivityIndicator style={styles.loader} color="#2563EB" />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t("admin.complaintsEmpty")}</Text>
            </View>
          ) : (
            filtered.map((item) => {
              const isResolved = item.status === "resolved";
              const updating = savingId === item.id;
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.rowTop}>
                    <Text style={styles.parentName}>{item.parentName}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        isResolved ? styles.statusPillResolved : styles.statusPillOpen,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isResolved
                            ? styles.statusPillTextResolved
                            : styles.statusPillTextOpen,
                        ]}
                      >
                        {isResolved
                          ? t("admin.complaintFilterResolved")
                          : t("admin.complaintFilterOpen")}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.meta}>
                    {t("common.date")}: {formatWhen(item.createdAt)}
                  </Text>
                  {isResolved ? (
                    <Text style={styles.meta}>
                      {t("admin.complaintResolvedOn")}: {formatWhen(item.resolvedAt)}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      isResolved ? styles.actionBtnOpen : styles.actionBtnResolve,
                      updating && styles.actionBtnDisabled,
                    ]}
                    onPress={() => void toggleResolved(item)}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.actionBtnText}>
                        {isResolved
                          ? t("admin.complaintMarkOpen")
                          : t("admin.complaintMarkResolved")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </ScrollView>
      </AdminScreenShell>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  filterChipActive: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  search: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  loader: { marginTop: 22 },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    backgroundColor: "#FFFFFF",
    padding: 18,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    backgroundColor: "#FFFFFF",
    padding: 14,
    marginBottom: 10,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  parentName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillOpen: { backgroundColor: "#FEF3C7" },
  statusPillResolved: { backgroundColor: "#DCFCE7" },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusPillTextOpen: { color: "#92400E" },
  statusPillTextResolved: { color: "#166534" },
  subject: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  message: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: "#64748B",
  },
  actionBtn: {
    alignSelf: "flex-start",
    marginTop: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    minHeight: 38,
    justifyContent: "center",
  },
  actionBtnResolve: {
    backgroundColor: "#15803D",
  },
  actionBtnOpen: {
    backgroundColor: "#B45309",
  },
  actionBtnDisabled: {
    opacity: 0.7,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
