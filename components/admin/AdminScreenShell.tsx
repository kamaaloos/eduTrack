import { router } from "expo-router";
import React, { useContext, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { useAdminSideMenuItems } from "../../hooks/useAdminSideMenuItems";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { AuthContext } from "../../src/context/authContext";
import { useSchoolContext } from "../../src/context/schoolContext";
import { APP_SCREEN_BACKGROUND } from "../../src/constants/appTheme";
import {
  webAdminContentStyle,
  webAdminPagePaddingStyle,
} from "../../src/constants/webLayout";
import { ScreenBackgroundLayer } from "../ScreenBackgroundLayer";
import { AdminScreenHeader } from "./AdminScreenHeader";
import { AdminSideMenu } from "./AdminSideMenu";

type AdminScreenShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  children: ReactNode;
};

export function AdminScreenShell({
  title,
  subtitle,
  showBack = false,
  showNotifications = false,
  children,
}: AdminScreenShellProps) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { selectedSchool } = useSchoolContext();
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const menuItems = useAdminSideMenuItems();
  const notificationCount = useUnreadNotificationCount(
    showNotifications ? user?.uid : null,
  );

  return (
    <View style={styles.screen}>
      <ScreenBackgroundLayer />
      <AdminScreenHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        onMenuPress={() => setSideMenuVisible(true)}
        notificationCount={showNotifications ? notificationCount : 0}
        onNotificationsPress={
          showNotifications
            ? () => router.push("/(admin)/notifications" as never)
            : undefined
        }
      />
      <AdminSideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        title={t("admin.management")}
        subtitle={selectedSchool?.name ?? null}
        subtitleTone="accent"
        items={menuItems}
      />
      <View style={styles.body}>
        <View style={[styles.bodyInner, webAdminContentStyle(), webAdminPagePaddingStyle()]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: APP_SCREEN_BACKGROUND,
  },
  body: {
    flex: 1,
    backgroundColor: APP_SCREEN_BACKGROUND,
  },
  bodyInner: {
    flex: 1,
    width: "100%",
  },
});
