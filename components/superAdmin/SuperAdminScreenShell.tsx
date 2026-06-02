import React, { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { AdminSideMenu } from "../admin/AdminSideMenu";
import { useSuperAdminSideMenuItems } from "../../hooks/useSuperAdminSideMenuItems";
import { APP_SCREEN_BACKGROUND } from "../../src/constants/appTheme";
import {
  webAdminContentStyle,
  webAdminPagePaddingStyle,
} from "../../src/constants/webLayout";
import { ScreenBackgroundLayer } from "../ScreenBackgroundLayer";
import { SuperAdminScreenHeader } from "./SuperAdminScreenHeader";

type SuperAdminScreenShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  children: ReactNode;
};

export function SuperAdminScreenShell({
  title,
  subtitle,
  showBack = false,
  children,
}: SuperAdminScreenShellProps) {
  const { t } = useTranslation();
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const menuItems = useSuperAdminSideMenuItems();

  return (
    <View style={styles.screen}>
      <ScreenBackgroundLayer />
      <SuperAdminScreenHeader
        title={title}
        subtitle={subtitle}
        showBack={showBack}
        onMenuPress={() => setSideMenuVisible(true)}
      />
      <AdminSideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        title={t("superAdmin.schoolsTitle")}
        subtitle={t("profile.roleSuperAdmin")}
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
