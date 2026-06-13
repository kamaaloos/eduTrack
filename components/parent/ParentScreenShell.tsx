import { router } from "expo-router";
import React, { useContext, type ReactNode } from "react";
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
import { useParentMenu } from "../../src/context/parentMenuContext";
import { ScreenBackgroundLayer } from "../ScreenBackgroundLayer";
import { WebPageCardFrame, webPageBodyStyle } from "../layout/WebPageCard";
import { StudentScreenHeader } from "../students/StudentScreenHeader";
import { studentScreenStyles } from "../students/studentScreenStyles";

type ParentScreenShellProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: ViewStyle;
  headerRight?: ReactNode;
  children: ReactNode;
};

export function ParentScreenShell({
  title,
  subtitle,
  showBack = false,
  showMenu = true,
  showNotifications = true,
  scroll = false,
  refreshing = false,
  onRefresh,
  contentContainerStyle,
  headerRight,
  children,
}: ParentScreenShellProps) {
  const { user } = useContext(AuthContext);
  const layout = usePlatformLayout();
  const { openMenu } = useParentMenu();
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
    <View style={[styles.bodyFill, ...innerStyle]}>{children}</View>
  );

  return (
    <View style={styles.screen}>
      <ScreenBackgroundLayer />
      <WebPageCardFrame>
        <StudentScreenHeader
          title={title}
          subtitle={subtitle}
          showBack={showBack}
          showMenu={showMenu}
          notificationCount={showNotifications ? notificationCount : 0}
          onNotificationsPress={
            showNotifications
              ? () => router.push("/(parent)/notifications" as never)
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
  },
  bodyFill: {
    flex: 1,
    width: "100%",
    paddingTop: 12,
  },
});
