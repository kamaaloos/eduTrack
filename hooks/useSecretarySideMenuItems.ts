import { router } from "expo-router";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardLogout } from "../components/dashboard/DashboardHeader";
import type { AdminSideMenuItem } from "../components/admin/AdminSideMenu";
import { AuthContext } from "../src/context/authContext";

export function useSecretarySideMenuItems(): AdminSideMenuItem[] {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const handleLogout = useDashboardLogout(logout);

  return useMemo(
    () => [
      {
        key: "dashboard",
        label: t("secretary.dashboardTitle"),
        icon: "home-outline",
        onPress: () => router.push("/(secretary)/dashboard"),
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
