import { router } from "expo-router";
import { useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDashboardLogout } from "../components/dashboard/DashboardHeader";
import type { AdminSideMenuItem } from "../components/admin/AdminSideMenu";
import { AuthContext } from "../src/context/authContext";

export function useParentSideMenuItems(): AdminSideMenuItem[] {
  const { t } = useTranslation();
  const { logout } = useContext(AuthContext);
  const handleLogout = useDashboardLogout(logout);

  return useMemo(
    () => [
      {
        key: "home",
        label: t("tabs.parent.home"),
        icon: "home-outline",
        onPress: () => router.push("/(parent)/dashboard"),
      },
      {
        key: "report-card",
        label: t("tabs.parent.reportCard"),
        icon: "document-text-outline",
        onPress: () => router.push("/(parent)/report-card"),
      },
      {
        key: "alerts",
        label: t("tabs.parent.alerts"),
        icon: "notifications-outline",
        onPress: () => router.push("/(parent)/notifications"),
      },
      {
        key: "profile",
        label: t("tabs.parent.profile"),
        icon: "person-circle-outline",
        onPress: () => router.push("/(parent)/account"),
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
