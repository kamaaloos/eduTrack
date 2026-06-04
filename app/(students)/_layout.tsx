import { Tabs } from "expo-router";

import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoleGate } from "../../components/auth/RoleGate";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import {
  FLOATING_TAB_BAR_INSET,
  floatingTabBarStyle,
  floatingTabBarStyleForSafeArea,
  tabBarItemStyle,
  tabBarLabelStyle,
  tabSceneContainerStyle,
} from "../../src/constants/tabBar";
import { StudentMenuProvider } from "../../src/context/studentMenuContext";

export default function StudentLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarStyle = useMemo(
    () =>
      Platform.OS === "web"
        ? floatingTabBarStyle
        : floatingTabBarStyleForSafeArea(insets.bottom),
    [insets.bottom],
  );
  const sceneStyle = useMemo(
    () =>
      Platform.OS === "web"
        ? tabSceneContainerStyle
        : {
            ...tabSceneContainerStyle,
            paddingBottom: FLOATING_TAB_BAR_INSET + insets.bottom,
          },
    [insets.bottom],
  );

  return (
    <RoleGate allowedRole="student">
    <StudentMenuProvider>
    <RoleAppFrame copyrightBottomOffset={FLOATING_TAB_BAR_INSET}>
    <Tabs
      {...(Platform.OS !== "web"
        ? {
            safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
          }
        : {})}
      screenOptions={{
        headerShown: false,
        sceneStyle,
        sceneContainerStyle: sceneStyle,
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
