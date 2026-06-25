import { router } from "expo-router";
import React, { type ReactNode } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { AuthContext } from "../../src/context/authContext";
import { APP_SCREEN_BACKGROUND } from "../../src/constants/appTheme";
import {
  mobileScreenPaddingStyle,
} from "../../src/constants/webLayout";
import { webRolePagePaddingStyle } from "../../src/constants/platformLayout";
import { useStudentMenu } from "../../src/context/studentMenuContext";
import { useContext } from "react";
import { ScreenBackgroundLayer } from "../ScreenBackgroundLayer";
import { WebPageCardFrame, webPageBodyStyle } from "../layout/WebPageCard";
import { StudentScreenHeader } from "./StudentScreenHeader";
import { studentScreenStyles } from "./studentScreenStyles";

type StudentScreenShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  headerRight?: ReactNode;
  contentContainerStyle?: ViewStyle;
  children: ReactNode;
};

export function StudentScreenShell({
  title,
  subtitle,
  showBack = false,
  showMenu = true,
  showNotifications = false,
  scroll = true,
  refreshing = false,
  onRefresh,
  headerRight,
  contentContainerStyle,
  children,
}: StudentScreenShellProps) {
  const { user } = useContext(AuthContext);
  const layout = usePlatformLayout();
  const { openMenu } = useStudentMenu();
  const notificationCount = useUnreadNotificationCount(
    showNotifications ? user?.uid : null,
  );

  const innerStyle = [
    styles.bodyInner,
    webRolePagePaddingStyle(layout),
    mobileScreenPaddingStyle(),
  ];

  const body = scroll ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        studentScreenStyles.scrollContent,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      <View style={innerStyle}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[styles.bodyFill, ...innerStyle, styles.bodyFillStretch]}>
      {children}
    </View>
  );

  return (
    <View style={styles.screen}>
      <ScreenBackgroundLayer />
      <WebPageCardFrame sidebarLayout={layout.isDesktopWeb}>
        <StudentScreenHeader
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          showMenu={showMenu}
          hideMenuOnDesktopWeb
          notificationCount={showNotifications ? notificationCount : 0}
          onNotificationsPress={
            showNotifications
              ? () => router.push("/(students)/notifications" as never)
              : undefined
          }
          onMenuPress={openMenu}
          headerRight={headerRight}
        />
        <View style={[styles.body, webPageBodyStyle()]}>{body}</View>
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
  scroll: {
    flex: 1,
  },
  bodyInner: {
    width: "100%",
    alignItems: "center",
  },
  bodyFill: {
    flex: 1,
    width: "100%",
    paddingTop: 12,
  },
  bodyFillStretch: {
    alignItems: "stretch",
  },
});
