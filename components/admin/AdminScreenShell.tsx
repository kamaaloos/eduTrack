import { router } from "expo-router";
import React, { useContext, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { AuthContext } from "../../src/context/authContext";
import { useAdminMenu } from "../../src/context/adminMenuContext";
import { APP_SCREEN_BACKGROUND } from "../../src/constants/appTheme";
import { webRolePagePaddingStyle } from "../../src/constants/platformLayout";
import { ScreenBackgroundLayer } from "../ScreenBackgroundLayer";
import { WebPageCardFrame, webPageBodyStyle } from "../layout/WebPageCard";
import { AdminScreenHeader } from "./AdminScreenHeader";

type AdminScreenShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  showCurrentTerm?: boolean;
  children: ReactNode;
};

export function AdminScreenShell({
  title,
  subtitle,
  showBack = false,
  showNotifications = false,
  showCurrentTerm = false,
  children,
}: AdminScreenShellProps) {
  const layout = usePlatformLayout();
  const { user } = useContext(AuthContext);
  const { openMenu } = useAdminMenu();
  const notificationCount = useUnreadNotificationCount(
    showNotifications ? user?.uid : null,
  );

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
          notificationCount={showNotifications ? notificationCount : 0}
          onNotificationsPress={
            showNotifications
              ? () => router.push("/(admin)/notifications" as never)
              : undefined
          }
          showCurrentTerm={showCurrentTerm}
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
