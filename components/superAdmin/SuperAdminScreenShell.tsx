import React, { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { AdminSideMenu } from "../admin/AdminSideMenu";
import { useSuperAdminSideMenuItems } from "../../hooks/useSuperAdminSideMenuItems";
import { APP_SCREEN_BACKGROUND } from "../../src/constants/appTheme";
import {
  webAdminPagePaddingStyle,
} from "../../src/constants/webLayout";
import { ScreenBackgroundLayer } from "../ScreenBackgroundLayer";
import { WebPageCardFrame, webPageBodyStyle } from "../layout/WebPageCard";
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
      <WebPageCardFrame>
        <SuperAdminScreenHeader
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          onMenuPress={() => setSideMenuVisible(true)}
        />
        <View style={[styles.body, webPageBodyStyle()]}>
          <View style={[styles.bodyInner, webAdminPagePaddingStyle()]}>
            {children}
          </View>
        </View>
      </WebPageCardFrame>
      <AdminSideMenu
        visible={sideMenuVisible}
        onClose={() => setSideMenuVisible(false)}
        title={t("superAdmin.schoolsTitle")}
        subtitle={t("profile.roleSuperAdmin")}
        items={menuItems}
      />
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
