import { router } from "expo-router";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardLogout } from "../components/dashboard/DashboardHeader";
import type { AdminSideMenuItem } from "../components/admin/AdminSideMenu";
import { AuthContext } from "../src/context/authContext";

export function useAdminSideMenuItems(): AdminSideMenuItem[] {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const handleLogout = useDashboardLogout(logout);

  return useMemo(
    () => [
      {
        key: "dashboard",
        label: t("admin.dashboardTitle"),
        icon: "home-outline",
        onPress: () => router.push("/(admin)/dashboard"),
      },
      {
        key: "profile",
        label: t("admin.myProfile"),
        icon: "person-circle-outline",
        onPress: () => router.push("/(admin)/profile"),
      },
      {
        key: "notifications",
        label: t("admin.notificationsTitle"),
        icon: "notifications-outline",
        onPress: () => router.push("/(admin)/notifications" as never),
      },
      {
        key: "users",
        label: t("admin.users"),
        icon: "people-outline",
        onPress: () => router.push("/(admin)/users"),
      },
      {
        key: "classes",
        label: t("admin.classes"),
        icon: "library-outline",
        onPress: () => router.push("/(admin)/classes"),
      },
      {
        key: "assignments",
        label: t("admin.assignments"),
        icon: "git-network-outline",
        onPress: () => router.push("/(admin)/assignments"),
      },
      {
        key: "analytics",
        label: t("admin.analytics"),
        icon: "bar-chart-outline",
        onPress: () => router.push("/(admin)/analytics"),
      },
      {
        key: "performance",
        label: t("admin.performance"),
        icon: "trending-up-outline",
        onPress: () => router.push("/(admin)/performance"),
      },
      {
        key: "certificates",
        label: t("certificates.adminMenu"),
        icon: "document-text-outline",
        onPress: () => router.push("/(admin)/certificates" as never),
      },
      {
        key: "system",
        label: t("admin.system"),
        icon: "settings-outline",
        onPress: () => router.push("/(admin)/system"),
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
