import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  confirmDestructiveAction,
  showErrorAlert,
} from "../src/utils/confirmDialog";
import type { AdminSideMenuItem } from "../components/admin/AdminSideMenu";
import { useSuperAdminAuth } from "../src/context/superAdminAuthContext";

export function useSuperAdminSideMenuItems(): AdminSideMenuItem[] {
  const { t } = useTranslation();
  const { logout } = useSuperAdminAuth();

  const handleLogout = useCallback(() => {
    void (async () => {
      const confirmed = await confirmDestructiveAction(
        t("superAdmin.signOutTitle"),
        t("superAdmin.signOutConfirm"),
        t("common.logout"),
        t("common.cancel"),
      );
      if (!confirmed) return;

      try {
        await logout();
      } catch (err) {
        showErrorAlert(
          t("common.error"),
          err instanceof Error ? err.message : t("superAdmin.signOutFailed"),
        );
      }
    })();
  }, [t, logout]);

  return useMemo(
    () => [
      {
        key: "schools",
        label: t("superAdmin.schoolsTitle"),
        icon: "business-outline",
        onPress: () => router.push("/(super-admin)/schools" as never),
      },
      {
        key: "add-school",
        label: t("superAdmin.addSchool"),
        icon: "add-circle-outline",
        onPress: () => router.push("/(super-admin)/school-form" as never),
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
