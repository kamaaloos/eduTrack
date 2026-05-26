import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { AdminScreenHeader } from "../../components/admin/AdminScreenHeader";
import { ClassCreationCard } from "../../components/admin/ClassCreationCard";
import { ClassScheduleCard } from "../../components/admin/ClassScheduleCard";
import { useAdminData } from "../../src/context/adminDataContext";

export default function AdminClassesScreen() {
  const { t } = useTranslation();
  const { refreshAll, classes } = useAdminData();

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  return (
    <ErrorBoundary>
      <View style={styles.screen}>
        <AdminScreenHeader
          title={t("admin.classes")}
          subtitle={t("admin.classesSubtitle")}
          showBack
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.panel}>
            <ClassCreationCard onClassCreated={refreshAll} />
          </View>
          <View style={styles.panel}>
            <ClassScheduleCard
              classes={classes.map((c) => ({
                id: c.id,
                name: c.name || t("common.class"),
              }))}
            />
          </View>
        </ScrollView>
      </View>
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
});
