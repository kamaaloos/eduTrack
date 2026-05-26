import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SuperAdminScreenHeader } from "../../components/superAdmin/SuperAdminScreenHeader";
import {
  deleteSchoolRecord,
  listAllSchoolsForAdmin,
  setSchoolActive,
} from "../../src/services/schoolRegistryAdmin";
import type { SchoolRecord } from "../../src/types/school";

export default function SuperAdminSchoolsScreen() {
  const { t } = useTranslation();
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const toggleActive = async (school: SchoolRecord, active: boolean) => {
    setBusyId(school.id);
    try {
      await setSchoolActive(school.id, active);
      setSchools((prev) =>
        prev.map((item) => (item.id === school.id ? { ...item, active } : item)),
      );
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("superAdmin.updateStatusFailed"),
      );
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = (school: SchoolRecord) => {
    Alert.alert(
      t("superAdmin.deleteSchoolTitle"),
      t("superAdmin.deleteSchoolMessage", { name: school.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            setBusyId(school.id);
            try {
              await deleteSchoolRecord(school.id);
              setSchools((prev) => prev.filter((item) => item.id !== school.id));
            } catch (err) {
              Alert.alert(
                t("common.error"),
                err instanceof Error ? err.message : t("superAdmin.deleteSchoolFailed"),
              );
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <SuperAdminScreenHeader
        title={t("superAdmin.schoolsTitle")}
        subtitle={t("superAdmin.schoolsSubtitle")}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : (
        <FlatList
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
                <View style={styles.cardHeader}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="business" size={22} color="#1E3A8A" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardMeta}>
                      {item.city ? `${item.city} · ` : ""}
                      {item.firebase.projectId}
                    </Text>
                  </View>
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
                </View>

                <View style={styles.cardRow}>
                  <Text style={styles.rowLabel}>{t("superAdmin.showInApp")}</Text>
                  <Switch
                    value={item.active}
                    onValueChange={(value) => void toggleActive(item, value)}
                    disabled={busy}
                    trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
                    thumbColor={item.active ? "#1E3A8A" : "#F8FAFC"}
                  />
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() =>
                      router.push({
                        pathname: "/(super-admin)/school-form",
                        params: { id: item.id },
                      } as any)
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

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(super-admin)/school-form" as any)}
        accessibilityLabel={t("superAdmin.addSchool")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    textAlign: "center",
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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
  cardRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 12,
  },
  editButtonText: {
    color: "#1E3A8A",
    fontWeight: "700",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
