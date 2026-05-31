import { router } from "expo-router";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardLogout } from "../components/dashboard/DashboardHeader";
import type { AdminSideMenuItem } from "../components/admin/AdminSideMenu";
import { AuthContext } from "../src/context/authContext";

export function useTeacherSideMenuItems(): AdminSideMenuItem[] {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const handleLogout = useDashboardLogout(logout);

  return useMemo(
    () => [
      {
        key: "dashboard",
        label: t("tabs.teacher.home"),
        icon: "home-outline",
        onPress: () => router.push("/(teachers)/dashboard"),
      },
      {
        key: "profile",
        label: t("tabs.teacher.profile"),
        icon: "person-circle-outline",
        onPress: () => router.push("/(teachers)/logout"),
      },
      {
        key: "attendance",
        label: t("tabs.teacher.attendance"),
        icon: "calendar-outline",
        onPress: () => router.push("/(teachers)/attendance"),
      },
      {
        key: "academic",
        label: t("tabs.teacher.academic"),
        icon: "book-outline",
        onPress: () => router.push("/(teachers)/academic"),
      },
      {
        key: "exams",
        label: t("tabs.teacher.grades"),
        icon: "ribbon-outline",
        onPress: () => router.push("/(teachers)/exam-reports"),
      },
      {
        key: "absences",
        label: t("tabs.teacher.absences"),
        icon: "medkit-outline",
        onPress: () => router.push("/(teachers)/absence-reports"),
      },
      {
        key: "logout",
        label: t("common.logout"),
        icon: "log-out-outline",
        onPress: handleLogout,
      },
    ],
    [t, handleLogout],
  );
}
