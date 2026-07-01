import { router } from "expo-router";
import React, { useContext, type ReactNode } from "react";
import {
  Platform,
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
import { mobileScreenPaddingStyle } from "../../src/constants/webLayout";
import { webRolePagePaddingStyle } from "../../src/constants/platformLayout";
import { useTeacherMenu } from "../../src/context/teacherMenuContext";
import { ScreenBackgroundLayer } from "../ScreenBackgroundLayer";
import { WebPageCardFrame, webPageBodyStyle } from "../layout/WebPageCard";
import { StudentScreenHeader } from "../students/StudentScreenHeader";
import { studentScreenStyles } from "../students/studentScreenStyles";

type TeacherScreenShellProps = {
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

export function TeacherScreenShell({
  title,
  subtitle,
  showBack = false,
  showMenu = true,
  showNotifications = true,
  scroll = true,
  refreshing = false,
  onRefresh,
  headerRight,
  contentContainerStyle,
  children,
}: TeacherScreenShellProps) {
  const { user } = useContext(AuthContext);
  const layout = usePlatformLayout();
  const { openMenu } = useTeacherMenu();
  const notificationCount = useUnreadNotificationCount(
    showNotifications ? user?.uid : null,
  );

  const innerStyle: ViewStyle[] = [
    styles.bodyInner,
    webRolePagePaddingStyle(layout),
    mobileScreenPaddingStyle(),
  ].filter(Boolean) as ViewStyle[];

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
      <WebPageCardFrame sidebarLayout>
        <StudentScreenHeader
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          showMenu={showMenu}
          notificationCount={showNotifications ? notificationCount : 0}
          onNotificationsPress={
            showNotifications
              ? () => router.push("/(teachers)/notifications" as never)
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
    minHeight: 0,
    backgroundColor: APP_SCREEN_BACKGROUND,
  },
  scroll: {
    flex: 1,
  },
  bodyInner: {
    width: "100%",
    ...Platform.select({
      web: {},
      default: { alignItems: "center" as const },
    }),
  },
  bodyFill: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    paddingTop: Platform.OS === "web" ? 0 : 12,
  },
  bodyFillStretch: {
    alignItems: "stretch",
  },
});
