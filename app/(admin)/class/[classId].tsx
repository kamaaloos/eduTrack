import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import { AdminClassAttendancePanel } from "../../../components/admin/AdminClassAttendancePanel";
import { AdminClassPerformancePanel } from "../../../components/admin/AdminClassPerformancePanel";
import { AdminClassStudentNamesList } from "../../../components/admin/AdminClassStudentNamesList";
import { AdminScreenShell } from "../../../components/admin/AdminScreenShell";
import { useAdminData } from "../../../src/context/adminDataContext";
import { useSchoolTheme } from "../../../src/context/schoolThemeContext";
import { adminScreenScrollStyle } from "../../../src/constants/platformLayout";
import { usePlatformLayout } from "../../../hooks/usePlatformLayout";
import type { UserData } from "../../../hooks/useAdminUsers";

type ClassTab = "students" | "attendance" | "performance";

export default function AdminClassDetailScreen() {
  const { t } = useTranslation();
  const layout = usePlatformLayout();
  const { theme } = useSchoolTheme();
  const primary = theme.primaryColor;
  const { classId: classIdParam } = useLocalSearchParams<{ classId: string }>();
  const classId = String(classIdParam ?? "");
  const { classes, students, refreshAll, classesLoading, usersLoading } =
    useAdminData();
  const [tab, setTab] = useState<ClassTab>("students");

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

  const openStudentReport = (student: UserData) => {
    router.push({
      pathname: "/(admin)/student-report/[studentId]",
      params: {
        studentId: student.id,
        name: student.name || student.email || "",
        classId,
      },
    } as never);
  };

  const classTitle = classInfo?.name || t("common.classFallback");
  const isLoading = (classesLoading || usersLoading) && classStudents.length === 0;

  const tabs: { key: ClassTab; label: string }[] = [
    { key: "students", label: t("admin.classTabStudents") },
    { key: "attendance", label: t("admin.classTabAttendance") },
    { key: "performance", label: t("admin.classTabPerformance") },
  ];

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
          <View style={styles.tabs}>
            {tabs.map((item) => {
              const active = tab === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setTab(item.key)}
                  style={[
                    styles.tab,
                    active
                      ? { backgroundColor: primary, borderColor: primary }
                      : null,
                  ]}
                >
                  <Text
                    style={[styles.tabText, active ? styles.tabTextActive : null]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.panel}>
            {tab === "students" ? (
              <>
                <Text style={styles.panelHint}>{t("admin.classStudentsHint")}</Text>
                <AdminClassStudentNamesList
                  students={classStudents}
                  loading={isLoading}
                  onSelectStudent={openStudentReport}
                />
              </>
            ) : null}

            {tab === "attendance" ? (
              <AdminClassAttendancePanel
                classId={classId}
                students={classStudents}
              />
            ) : null}

            {tab === "performance" ? (
              <AdminClassPerformancePanel
                classId={classId}
                students={classStudents}
              />
            ) : null}
          </View>
        </ScrollView>
      </AdminScreenShell>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  panelHint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748B",
  },
});
