import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { BroadcastAnnouncementCard } from "../../components/admin/BroadcastAnnouncementCard";
import { ExcelImportCard } from "../../components/admin/ExcelImportCard";
import { DirectMessageCard } from "../../components/messaging/DirectMessageCard";
import { useAdminData } from "../../src/context/adminDataContext";
import { AuthContext } from "../../src/context/authContext";
import { showErrorAlert, showSuccessAlert } from "../../src/utils/confirmDialog";

export default function AdminSystemScreen() {
  const { t } = useTranslation();
  const { user, userData } = useContext(AuthContext);
  const {
    classes,
    students,
    refreshAll,
    syncClassIdsFromAssignments,
    loadUsers,
  } = useAdminData();
  const [directMessageClassId, setDirectMessageClassId] = useState("");

  const classOptions = useMemo(
    () =>
      classes.map((cls) => ({
        value: cls.id,
        label: cls.name || cls.id,
      })),
    [classes],
  );

  const studentOptions = useMemo(() => {
    if (!directMessageClassId) return [];
    return students
      .filter((s) => s.classId === directMessageClassId)
      .map((s) => ({
        value: s.id,
        label: s.name || s.email || s.id.slice(0, 8),
      }));
  }, [students, directMessageClassId]);

  useEffect(() => {
    if (directMessageClassId || classOptions.length === 0) return;
    setDirectMessageClassId(classOptions[0].value);
  }, [classOptions, directMessageClassId]);

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  const handleSyncClassIds = async () => {
    try {
      const result = await syncClassIdsFromAssignments();
      showSuccessAlert(t("admin.syncComplete"), result.message);
      await loadUsers();
    } catch (err) {
      showErrorAlert(
        t("common.error"),
        err instanceof Error ? err.message : t("admin.syncFailed"),
      );
    }
  };

  const handleImportComplete = async () => {
    await refreshAll();
  };

  return (
    <ErrorBoundary>
      <AdminScreenShell
        title={t("admin.system")}
        subtitle={t("admin.systemSubtitle")}
        showBack
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.systemCard}>
            <Text style={styles.systemTitle}>{t("admin.classSyncTitle")}</Text>
            <Text style={styles.systemText}>{t("admin.classSyncDesc")}</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSyncClassIds}
            >
              <Text style={styles.primaryButtonText}>{t("admin.syncClassIds")}</Text>
            </TouchableOpacity>
          </View>

          <BroadcastAnnouncementCard classCount={classes.length} />

          <DirectMessageCard
            classOptions={classOptions}
            selectedClassId={directMessageClassId}
            onClassChange={setDirectMessageClassId}
            students={studentOptions}
            senderRole="admin"
            senderId={user?.uid}
            senderName={userData?.name ?? t("common.admin")}
          />

          <ExcelImportCard onImportComplete={handleImportComplete} />
        </ScrollView>
      </AdminScreenShell>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  systemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  systemTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  systemText: {
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
