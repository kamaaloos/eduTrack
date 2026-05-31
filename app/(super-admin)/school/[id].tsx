import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SchoolBillingMetrics } from "../../../components/superAdmin/SchoolBillingMetrics";
import { SuperAdminScreenShell } from "../../../components/superAdmin/SuperAdminScreenShell";
import {
  deleteSchoolRecord,
  getSchoolForAdmin,
  setSchoolActive,
} from "../../../src/services/schoolRegistryAdmin";
import { refreshSchoolUserCounts } from "../../../src/services/schoolUserCountSync";
import type { SchoolRecord } from "../../../src/types/school";

export default function SuperAdminSchoolDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const schoolId = String(id ?? "");

  const [school, setSchool] = useState<SchoolRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoadError(null);

    try {
      const record = await getSchoolForAdmin(schoolId);
      if (!record) {
        setLoadError(t("superAdmin.schoolNotFound"));
        setSchool(null);
        return;
      }
      setSchool(record);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : t("superAdmin.schoolsLoadFailed"),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [schoolId, t]);

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

  const syncUserCount = async () => {
    if (!schoolId) return;
    setSyncing(true);
    try {
      const result = await refreshSchoolUserCounts(schoolId);
      if ("ok" in result && !result.ok) {
        Alert.alert(
          t("common.error"),
          result.error ?? t("superAdmin.syncUserCountsFailed"),
        );
      }
      await load();
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("superAdmin.syncUserCountsFailed"),
      );
    } finally {
      setSyncing(false);
    }
  };

  const toggleActive = async (active: boolean) => {
    if (!school) return;
    setBusy(true);
    try {
      await setSchoolActive(school.id, active);
      setSchool({ ...school, active });
    } catch (err) {
      Alert.alert(
        t("common.error"),
        err instanceof Error ? err.message : t("superAdmin.updateStatusFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    if (!school) return;
    Alert.alert(
      t("superAdmin.deleteSchoolTitle"),
      t("superAdmin.deleteSchoolMessage", { name: school.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await deleteSchoolRecord(school.id);
              router.back();
            } catch (err) {
              Alert.alert(
                t("common.error"),
                err instanceof Error ? err.message : t("superAdmin.deleteSchoolFailed"),
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  if (loading && !school) {
    return (
      <SuperAdminScreenShell title={t("superAdmin.schoolDetail")} showBack>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      </SuperAdminScreenShell>
    );
  }

  if (loadError || !school) {
    return (
      <SuperAdminScreenShell title={t("superAdmin.schoolDetail")} showBack>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{loadError ?? t("superAdmin.schoolNotFound")}</Text>
        </View>
      </SuperAdminScreenShell>
    );
  }

  return (
    <SuperAdminScreenShell
      title={school.name}
      subtitle={school.city ?? school.firebase.projectId}
      showBack
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            {school.logoUrl ? (
              <Image source={{ uri: school.logoUrl }} style={styles.logo} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Ionicons name="business" size={28} color="#1E3A8A" />
              </View>
            )}
            <View style={styles.heroInfo}>
              <Text style={styles.heroTitle}>{school.name}</Text>
              {school.city ? (
                <Text style={styles.heroMeta}>{school.city}</Text>
              ) : null}
              <Text style={styles.heroMeta}>{school.firebase.projectId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("superAdmin.billingAndSubscription")}</Text>
            <TouchableOpacity
              style={styles.syncButton}
              onPress={() => void syncUserCount()}
              disabled={syncing}
            >
              {syncing ? (
                <ActivityIndicator size="small" color="#1E3A8A" />
              ) : (
                <Ionicons name="refresh-outline" size={16} color="#1E3A8A" />
              )}
              <Text style={styles.syncButtonText}>{t("superAdmin.syncUserCounts")}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionHint}>{t("superAdmin.billingHint")}</Text>
          <SchoolBillingMetrics school={school} />
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{t("superAdmin.showInApp")}</Text>
            <Switch
              value={school.active}
              onValueChange={(value) => void toggleActive(value)}
              disabled={busy}
              trackColor={{ false: "#CBD5E1", true: "#93C5FD" }}
              thumbColor={school.active ? "#1E3A8A" : "#F8FAFC"}
            />
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              router.push({
                pathname: "/(super-admin)/school-form",
                params: { id: school.id },
              } as never)
            }
            disabled={busy}
          >
            <Ionicons name="create-outline" size={18} color="#1E3A8A" />
            <Text style={styles.editButtonText}>{t("common.edit")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={confirmDelete}
            disabled={busy}
          >
            <Ionicons name="trash-outline" size={18} color="#B91C1C" />
            <Text style={styles.deleteButtonText}>{t("common.delete")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SuperAdminScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 15,
    textAlign: "center",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroInfo: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  heroMeta: {
    marginTop: 2,
    fontSize: 13,
    color: "#64748B",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionHint: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    marginBottom: 8,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
  },
  syncButtonText: {
    color: "#1E3A8A",
    fontSize: 12,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingVertical: 14,
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
    paddingVertical: 14,
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontWeight: "700",
  },
});
