import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { ErrorBoundary } from "../../../components/ErrorBoundary";
import { AdminScreenHeader } from "../../../components/admin/AdminScreenHeader";
import { UserDirectoryList } from "../../../components/admin/UserDirectoryList";
import type { UserRole } from "../../../hooks/useAdminUsers";
import { useAdminData } from "../../../src/context/adminDataContext";

export default function UserDirectoryScreen() {
  const { t } = useTranslation();
  const { role: roleParam } = useLocalSearchParams<{ role: string }>();
  const role = (roleParam === "teacher" ||
  roleParam === "parent" ||
  roleParam === "student"
    ? roleParam
    : "student") as UserRole;

  const roleConfig = useMemo(
    () =>
      ({
        student: {
          title: t("admin.students"),
          subtitle: t("admin.studentDirSubtitle"),
          listKey: "students" as const,
        },
        teacher: {
          title: t("admin.teachers"),
          subtitle: t("admin.teacherDirSubtitle"),
          listKey: "teachers" as const,
        },
        parent: {
          title: t("admin.parents"),
          subtitle: t("admin.parentDirSubtitle"),
          listKey: "parents" as const,
        },
        admin: {
          title: t("common.admin"),
          subtitle: t("admin.studentDirSubtitle"),
          listKey: "students" as const,
        },
      }) satisfies Record<
        UserRole,
        {
          title: string;
          subtitle: string;
          listKey: "students" | "teachers" | "parents";
        }
      >,
    [t],
  );

  const config = roleConfig[role];
  const { students, teachers, parents, refreshAll } = useAdminData();

  const users =
    config.listKey === "students"
      ? students
      : config.listKey === "teachers"
        ? teachers
        : parents;

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll]),
  );

  return (
    <ErrorBoundary>
      <View style={styles.screen}>
        <AdminScreenHeader
          title={config.title}
          subtitle={config.subtitle}
          showBack
        />
        <View style={styles.body}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <UserDirectoryList
              role={role}
              title={config.title}
              subtitle={config.subtitle}
              users={users}
            />
          </ScrollView>
        </View>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "transparent" },
  body: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
