import React, { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { APP_SCREEN_BACKGROUND } from "../../src/constants/appTheme";
import { webRolePagePaddingStyle } from "../../src/constants/platformLayout";
import { useSecretaryMenu } from "../../src/context/secretaryMenuContext";
import { ScreenBackgroundLayer } from "../ScreenBackgroundLayer";
import { WebPageCardFrame, webPageBodyStyle } from "../layout/WebPageCard";
import { AdminScreenHeader } from "../admin/AdminScreenHeader";

type SecretaryScreenShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  children: ReactNode;
};

export function SecretaryScreenShell({
  title,
  subtitle,
  showBack = false,
  children,
}: SecretaryScreenShellProps) {
  const layout = usePlatformLayout();
  const { openMenu } = useSecretaryMenu();

  return (
    <View style={styles.screen}>
      <ScreenBackgroundLayer />
      <WebPageCardFrame sidebarLayout={layout.isDesktopWeb}>
        <AdminScreenHeader
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          hideMenuOnDesktopWeb
          onMenuPress={openMenu}
          notificationCount={0}
        />
        <View style={[styles.body, webPageBodyStyle()]}>
          <View style={[styles.bodyInner, webRolePagePaddingStyle(layout)]}>
            {children}
          </View>
        </View>
      </WebPageCardFrame>
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
