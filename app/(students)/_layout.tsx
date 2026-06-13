import { Tabs } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoleGate } from "../../components/auth/RoleGate";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import { usePlatformLayout } from "../../hooks/usePlatformLayout";
import { webTabBarStyle } from "../../src/constants/platformLayout";
import {
  floatingTabBarStyle,
  floatingTabBarStyleForSafeArea,
  STUDENT_COPYRIGHT_BOTTOM_OFFSET,
  tabBarItemStyle,
  tabBarLabelStyle,
  tabSceneContainerStyle,
} from "../../src/constants/tabBar";
import { StudentMenuProvider } from "../../src/context/studentMenuContext";

export default function StudentLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const layout = usePlatformLayout();
  const tabBarStyle = useMemo(
    () =>
      Platform.OS === "web"
        ? { ...floatingTabBarStyle, ...webTabBarStyle(layout) }
        : floatingTabBarStyleForSafeArea(insets.bottom),
    [insets.bottom, layout.isDesktopWeb, layout.isTabletWeb, layout.width],
  );

  return (
    <RoleGate allowedRole="student">
    <StudentMenuProvider>
    <RoleAppFrame copyrightBottomOffset={STUDENT_COPYRIGHT_BOTTOM_OFFSET}>
    <Tabs
      {...(Platform.OS !== "web"
        ? {
            safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
          }
        : {})}
      screenOptions={{
        headerShown: false,
        lazy: true,
        detachInactiveScreens: true,
        sceneStyle: tabSceneContainerStyle,
        sceneContainerStyle: tabSceneContainerStyle,
        tabBarShowLabel: true,
        tabBarActiveTintColor:
          Platform.OS === "web" ? "#1D4ED8" : "#2563EB",
        tabBarInactiveTintColor:
          Platform.OS === "web" ? "#64748B" : "#9CA3AF",
        tabBarStyle: tabBarStyle,
        tabBarItemStyle: Platform.OS === "web" ? tabBarItemStyle : undefined,

        tabBarLabelStyle:
          Platform.OS === "web"
            ? tabBarLabelStyle
            : {
                fontSize: 12,
                fontWeight: "600",
              },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("tabs.student.home"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: t("tabs.student.attendance"),

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: t("tabs.student.analytics"),

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="report-card"
        options={{
          title: t("tabs.student.reports"),

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t("tabs.student.profile"),

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden Screens */}

      <Tabs.Screen name="homeworks" options={{ href: null }} />

      <Tabs.Screen name="messages" options={{ href: null }} />

      <Tabs.Screen name="remarks" options={{ href: null }} />

      <Tabs.Screen name="exams" options={{ href: null }} />

      <Tabs.Screen name="announcement-detail" options={{ href: null, headerShown: false }} />

      <Tabs.Screen name="homework-detail" options={{ href: null, headerShown: false }} />

      <Tabs.Screen name="exam-detail" options={{ href: null, headerShown: false }} />

      <Tabs.Screen name="remark-detail" options={{ href: null, headerShown: false }} />

      <Tabs.Screen name="attendance-detail" options={{ href: null, headerShown: false }} />
    </Tabs>
    </RoleAppFrame>
    </StudentMenuProvider>
    </RoleGate>
  );
}
