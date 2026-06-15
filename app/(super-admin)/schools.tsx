import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SchoolBillingMetrics } from "../../components/superAdmin/SchoolBillingMetrics";
import { SuperAdminScreenShell } from "../../components/superAdmin/SuperAdminScreenShell";
import {
  deleteSchoolRecord,
  listAllSchoolsForAdmin,
  setSchoolActive,
} from "../../src/services/schoolRegistryAdmin";
import { refreshSchoolUserCounts } from "../../src/services/schoolUserCountSync";
import type { SchoolRecord } from "../../src/types/school";
import { INNER_CARD_BORDER_GREEN } from "../../src/constants/innerCardBorders";
import {
  confirmDestructiveAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../src/utils/confirmDialog";

export default function SuperAdminSchoolsScreen() {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await listAllSchoolsForAdmin();
      setSchools(list);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("superAdmin.schoolsLoadFailed"),
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

  const syncAllUserCounts = async () => {
    setSyncing(true);
    try {
      const result = await refreshSchoolUserCounts();
      if ("failed" in result && result.failed > 0) {
        showErrorAlert(
          t("superAdmin.syncPartialTitle"),
          t("superAdmin.syncPartialMessage", {
            synced: result.synced,
            failed: result.failed,
          }),
        );
      } else {
        showSuccessAlert(t("common.success"), t("superAdmin.syncAllUserCounts"));
      }
      await load();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("superAdmin.syncUserCountsFailed"),
      );
    } finally {
      setSyncing(false);
    }
  };

  const toggleActive = async (school: SchoolRecord, active: boolean) => {
    setBusyId(school.id);
    try {
      await setSchoolActive(school.id, active);
      setSchools((prev) =>
        prev.map((item) => (item.id === school.id ? { ...item, active } : item)),
      );
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("superAdmin.updateStatusFailed"),
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (school: SchoolRecord) => {
    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("superAdmin.deleteSchoolTitle"),
        t("superAdmin.deleteSchoolMessage", { name: school.name }),
        t("common.delete"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      setBusyId(school.id);
      try {
        await deleteSchoolRecord(school.id);
        setSchools((prev) => prev.filter((item) => item.id !== school.id));
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("superAdmin.deleteSchoolFailed"),
        );
      } finally {
        setBusyId(null);
      }
    })();
  };

  const openSchool = (schoolId: string) => {
    router.push({
      pathname: "/(super-admin)/school/[id]",
      params: { id: schoolId },
    } as never);
  };

  return (
    <SuperAdminScreenShell
      title={t("superAdmin.schoolsTitle")}
      subtitle={t("superAdmin.schoolsSubtitle")}
    >
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {schools.length > 0 ? (
        <View style={styles.toolbar}>
          <Pressable
            style={({ pressed }) => [
              styles.toolbarBtn,
              styles.toolbarBtnSecondary,
              pressed && styles.toolbarBtnPressed,
            ]}
            onPress={() => void syncAllUserCounts()}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#1E3A8A" />
            ) : (
              <Ionicons name="refresh-outline" size={18} color="#1E3A8A" />
            )}
            <Text style={styles.toolbarBtnSecondaryText}>
              {t("superAdmin.syncAllUserCounts")}
            </Text>
          </Pressable>

          {Platform.OS === "web" ? (
            <Pressable
              style={({ pressed }) => [
                styles.toolbarBtn,
                styles.toolbarBtnPrimary,
                pressed && styles.toolbarBtnPressed,
              ]}
              onPress={() => router.push("/(super-admin)/school-form" as never)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.toolbarBtnPrimaryText}>
                {t("superAdmin.addSchool")}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <FlatList
          style={styles.listScroll}
          data={schools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons name="school-outline" size={42} color="#94A3B8" />
              <Text style={styles.emptyTitle}>{t("superAdmin.schoolsEmpty")}</Text>
              <Text style={styles.emptyText}>{t("superAdmin.schoolsEmptyHint")}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const busy = busyId === item.id;

            return (
              <View style={styles.card}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => openSchool(item.id)}
                  accessibilityRole="button"
                  accessibilityHint={t("superAdmin.tapForDetails")}
                >
                  <View style={styles.cardHeader}>
                    {item.logoUrl ? (
                      <Image source={{ uri: item.logoUrl }} style={styles.cardLogo} />
                    ) : (
                      <View style={styles.cardIcon}>
                        <Ionicons name="business" size={22} color="#1E3A8A" />
                      </View>
                    )}
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      <Text style={styles.cardMeta}>
                        {item.city ? `${item.city} · ` : ""}
                        {item.firebase.projectId}
                      </Text>
                    </View>
                    <View style={styles.chevronWrap}>
                      <Ionicons name="chevron-forward" size={22} color="#94A3B8" />
                    </View>
                  </View>

                  <SchoolBillingMetrics school={item} compact />

                  <Text style={styles.tapHint}>{t("superAdmin.tapForDetails")}</Text>
                </TouchableOpacity>

                <View style={styles.cardFooter}>
                  <View
                    style={[
                      styles.badge,
                      item.active ? styles.badgeActive : styles.badgeInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.active ? styles.badgeTextActive : styles.badgeTextInactive,
                      ]}
                    >
                      {item.active ? t("superAdmin.active") : t("superAdmin.hidden")}
                    </Text>
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.rowLabel}>{t("superAdmin.showInApp")}</Text>
                    <Switch
                      value={item.active}
                      onValueChange={(value) => void toggleActive(item, value)}
                      disabled={busy}
                      trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
                      thumbColor={item.active ? "#1E3A8A" : "#F8FAFC"}
                    />
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      router.push({
                        pathname: "/(super-admin)/school-form",
                        params: { id: item.id },
                      } as never)
                    }
                    disabled={busy}
                  >
                    <Ionicons name="create-outline" size={18} color="#1E3A8A" />
                    <Text style={styles.editButtonText}>{t("common.edit")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => confirmDelete(item)}
                    disabled={busy}
                  >
                    <Ionicons name="trash-outline" size={18} color="#B91C1C" />
                    <Text style={styles.deleteButtonText}>{t("common.delete")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {Platform.OS !== "web" ? (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(super-admin)/school-form" as never)}
          accessibilityLabel={t("superAdmin.addSchool")}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      ) : null}
    </SuperAdminScreenShell>
  );
}

const isWeb = Platform.OS === "web";

const styles = StyleSheet.create({
  listScroll: {
    flex: 1,
  },
  list: {
    paddingTop: isWeb ? 12 : 8,
    paddingBottom: isWeb ? 32 : 100,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: isWeb ? 12 : 8,
    marginBottom: 12,
  },
  toolbarBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minHeight: 42,
  },
  toolbarBtnSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
    flexGrow: isWeb ? 0 : 1,
    flex: isWeb ? undefined : 1,
  },
  toolbarBtnPrimary: {
    backgroundColor: "#1E3A8A",
    marginLeft: isWeb ? "auto" : 0,
  },
  toolbarBtnPressed: {
    opacity: 0.9,
  },
  toolbarBtnSecondaryText: {
    color: "#1E3A8A",
    fontWeight: "700",
    fontSize: 14,
  },
  toolbarBtnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    marginTop: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },
  syncBar: {
    display: "none",
  },
  syncBarText: {
    display: "none",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: isWeb ? 12 : 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748B",
  },
  chevronWrap: {
    flexShrink: 0,
  },
  tapHint: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: "#2563EB",
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeActive: {
    backgroundColor: "#DCFCE7",
  },
  badgeInactive: {
    backgroundColor: "#F1F5F9",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  badgeTextActive: {
    color: "#15803D",
  },
  badgeTextInactive: {
    color: "#64748B",
  },
  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: INNER_CARD_BORDER_GREEN,
  },
  editButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontWeight: "700",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1E3A8A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
