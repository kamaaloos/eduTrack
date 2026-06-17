import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenShell } from "../../components/admin/AdminScreenShell";
import { ClassCreationCard } from "../../components/admin/ClassCreationCard";
import { AdminClassBrowseList } from "../../components/admin/AdminClassBrowseList";
import { ClassScheduleCard } from "../../components/admin/ClassScheduleCard";
import { useAdminData } from "../../src/context/adminDataContext";

export default function AdminClassesScreen() {
  const { t } = useTranslation();
  const { refreshAll, classes, teachers } = useAdminData();

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  return (
    <ErrorBoundary>
      <AdminScreenShell
        title={t("admin.classes")}
        subtitle={t("admin.classesSubtitle")}
        showBack
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>{t("admin.classBrowseTitle")}</Text>
            <Text style={styles.sectionHint}>{t("admin.classBrowseHint")}</Text>
            <AdminClassBrowseList classes={classes} />
          </View>
          <View style={styles.panel}>
            <ClassCreationCard onClassCreated={refreshAll} />
          </View>
          <View style={styles.panel}>
            <ClassScheduleCard
              classes={classes.map((c) => ({
                id: c.id,
                name: c.name || t("common.class"),
              }))}
              teachers={teachers.map((teacher) => ({
                id: teacher.id,
                name: teacher.name || teacher.email || t("common.teacher"),
              }))}
            />
          </View>
        </ScrollView>
      </AdminScreenShell>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  sectionHint: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 14,
  },
});
