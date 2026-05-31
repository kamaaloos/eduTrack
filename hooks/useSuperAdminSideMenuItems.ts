import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import type { AdminSideMenuItem } from "../components/admin/AdminSideMenu";
import { useSuperAdminAuth } from "../src/context/superAdminAuthContext";

export function useSuperAdminSideMenuItems(): AdminSideMenuItem[] {
  const { t } = useTranslation();
  const { logout } = useSuperAdminAuth();

  const handleLogout = useCallback(() => {
    Alert.alert(t("superAdmin.signOutTitle"), t("superAdmin.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (err) {
            Alert.alert(
              t("common.error"),
              err instanceof Error ? err.message : t("superAdmin.signOutFailed"),
            );
          }
        },
      },
    ]);
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
