import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import { AdminClassStudentNamesList } from "../../../components/admin/AdminClassStudentNamesList";
import { AdminScreenShell } from "../../../components/admin/AdminScreenShell";
import { useAdminData } from "../../../src/context/adminDataContext";
import { adminScreenScrollStyle } from "../../../src/constants/platformLayout";
import { usePlatformLayout } from "../../../hooks/usePlatformLayout";

export default function AdminClassDetailScreen() {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const { classId: classIdParam } = useLocalSearchParams<{ classId: string }>();
  const classId = String(classIdParam ?? "");
  const { classes, students, refreshAll, classesLoading, usersLoading } =
    useAdminData();

  const classInfo = useMemo(
    () => classes.find((item) => item.id === classId),
    [classes, classId],
  );

  const classStudents = useMemo(
    () =>
      students
        .filter((student) => student.classId === classId)
        .sort((a, b) =>
          (a.name || a.email || "").localeCompare(
            b.name || b.email || "",
            undefined,
            { sensitivity: "base" },
          ),
        ),
    [students, classId],
  );

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  const classTitle = classInfo?.name || t("common.classFallback");
  const isLoading = (classesLoading || usersLoading) && classStudents.length === 0;

  return (
    <ErrorBoundary>
      <AdminScreenShell
        title={classTitle}
        subtitle={t("admin.classDetailSubtitle")}
        showBack
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={adminScreenScrollStyle(layout)}
        >
          <View style={styles.panel}>
            <AdminClassStudentNamesList
              students={classStudents}
              loading={isLoading}
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
  },
});
