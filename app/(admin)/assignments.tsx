import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { ClassSubjectsCard } from "../../components/admin/ClassSubjectsCard";
import { RelationsCard } from "../../components/admin/RelationsCard";
import { TeacherSubjectAssignmentCard } from "../../components/admin/TeacherSubjectAssignmentCard";
import { useAdminData } from "../../src/context/adminDataContext";

export default function AdminAssignmentsScreen() {
  const { t } = useTranslation();
  const {
    students,
    parents,
    classes,
    refreshAll,
    repairParentStudentLinks,
    relationsLoading,
  } = useAdminData();

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
      void repairParentStudentLinks().catch(() => {});
    }, [refreshAll, repairParentStudentLinks]),
  );

  const onRepairLinks = async () => {
    try {
      const message = await repairParentStudentLinks();
      Alert.alert(t("admin.linksRepaired"), message);
    } catch (err) {
      Alert.alert(
        t("admin.repairFailed"),
        err instanceof Error ? err.message : t("common.unknown"),
      );
    }
  };

  return (
    <ErrorBoundary>
      <AdminScreenShell
        title={t("admin.assignments")}
        subtitle={t("admin.assignmentsSubtitle")}
        showBack
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.panel}>
            <RelationsCard
              title={t("admin.assignStudentToClass")}
              type="student-class"
              leftItems={students.map((s) => ({ id: s.id, name: s.name }))}
              rightItems={classes.map((c) => ({ id: c.id, name: c.name }))}
              leftLabel={t("admin.students")}
              rightLabel={t("admin.classes")}
              onAssignSuccess={refreshAll}
            />
          </View>

          <View style={styles.panel}>
            <ClassSubjectsCard />
          </View>

          <View style={styles.panel}>
            <TeacherSubjectAssignmentCard />
          </View>

          <View style={styles.panel}>
            <RelationsCard
              title={t("admin.linkParentToStudent")}
              type="parent-student"
              leftItems={parents.map((p) => ({ id: p.id, name: p.name }))}
              rightItems={students.map((s) => ({ id: s.id, name: s.name }))}
              leftLabel={t("admin.parents")}
              rightLabel={t("admin.students")}
            />
            <Text style={styles.hint}>{t("admin.parentLinkHint")}</Text>
            <TouchableOpacity
              style={styles.repairBtn}
              onPress={onRepairLinks}
              disabled={relationsLoading}
            >
              <Text style={styles.repairBtnText}>{t("admin.repairParentLinks")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </AdminScreenShell>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  repairBtn: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
  },
  repairBtnText: {
    fontWeight: "600",
    color: "#334155",
  },
});
