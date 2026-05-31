import { router } from "expo-router";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardLogout } from "../components/dashboard/DashboardHeader";
import type { AdminSideMenuItem } from "../components/admin/AdminSideMenu";
import { AuthContext } from "../src/context/authContext";

export function useStudentSideMenuItems(): AdminSideMenuItem[] {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const handleLogout = useDashboardLogout(logout);

  return useMemo(
    () => [
      {
        key: "dashboard",
        label: t("tabs.student.home"),
        icon: "home-outline",
        onPress: () => router.push("/(students)/dashboard"),
      },
      {
        key: "attendance",
        label: t("tabs.student.attendance"),
        icon: "calendar-outline",
        onPress: () => router.push("/(students)/attendance"),
      },
      {
        key: "analytics",
        label: t("tabs.student.analytics"),
        icon: "stats-chart-outline",
        onPress: () => router.push("/(students)/analytics"),
      },
      {
        key: "report-card",
        label: t("tabs.student.reports"),
        icon: "document-text-outline",
        onPress: () => router.push("/(students)/report-card"),
      },
      {
        key: "notifications",
        label: t("notifications.title"),
        icon: "notifications-outline",
        onPress: () => router.push("/(students)/notifications"),
      },
      {
        key: "profile",
        label: t("tabs.student.profile"),
        icon: "person-circle-outline",
        onPress: () => router.push("/(students)/account"),
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
