import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { AdminScreenShell } from "../../../components/admin/AdminScreenShell";
import { AdminTeacherClassesPanel } from "../../../components/admin/AdminTeacherClassesPanel";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import { usePlatformLayout } from "../../../hooks/usePlatformLayout";
import { adminScreenScrollStyle } from "../../../src/constants/platformLayout";
import { useAdminData } from "../../../src/context/adminDataContext";

export default function AdminTeacherDetailScreen() {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const { teacherId: teacherIdParam } = useLocalSearchParams<{
    teacherId: string;
  }>();
  const teacherId = String(teacherIdParam ?? "");
  const { teachers, loadUsers, loadClasses } = useAdminData();

  const teacher = useMemo(
    () => teachers.find((item) => item.id === teacherId),
    [teachers, teacherId],
  );

  useFocusEffect(
    useCallback(() => {
      void Promise.all([loadUsers(), loadClasses()]);
    }, [loadUsers, loadClasses]),
  );

  const title =
    teacher?.name || teacher?.email || t("admin.teacherDetailTitle");

  return (
    <ErrorBoundary>
      <AdminScreenShell
        title={title}
        subtitle={t("admin.teacherDetailSubtitle")}
        showBack
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={adminScreenScrollStyle(layout)}
        >
          <View style={styles.panel}>
            {teacher?.email ? (
              <Text style={styles.email}>{teacher.email}</Text>
            ) : null}
            <AdminTeacherClassesPanel
              teacherId={teacherId}
              teacherName={title}
            />
          </View>
        </ScrollView>
      </AdminScreenShell>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  email: {
    fontSize: 13,
    color: "#64748B",
  },
});
