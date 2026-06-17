import { Ionicons } from "@expo/vector-icons";
import { Stack, Tabs } from "expo-router";
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
  tabSceneContainerStyle,
  WEB_SHELL_CONTENT_STYLE,
} from "../../src/constants/tabBar";
import { StudentMenuProvider } from "../../src/context/studentMenuContext";

const STUDENT_STACK_SCREENS = [
  "dashboard",
  "attendance",
  "analytics",
  "notifications",
  "report-card",
  "account",
  "homeworks",
  "messages",
  "remarks",
  "exams",
  "announcement-detail",
  "homework-detail",
  "exam-detail",
  "remark-detail",
  "attendance-detail",
] as const;

/** Web: stack navigation + hamburger menu (no bottom tabs). */
function StudentWebStack() {
  return (
    <Stack
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: WEB_SHELL_CONTENT_STYLE,
      }}
    >
      {STUDENT_STACK_SCREENS.map((name) => (
        <Stack.Screen key={name} name={name} />
      ))}
    </Stack>
  );
}

function StudentNativeTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const layout = usePlatformLayout();
  const tabBarStyle = useMemo(
    () =>
      Platform.OS === "web"
        ? { ...floatingTabBarStyle, ...webTabBarStyle(layout) }
        : floatingTabBarStyleForSafeArea(insets.bottom),
    [insets.bottom, layout],
  );

  return (
    <Tabs
      {...{
        safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 },
      }}
      screenOptions={{
        headerShown: false,
        lazy: true,
        detachInactiveScreens: true,
        sceneStyle: tabSceneContainerStyle,
        sceneContainerStyle: tabSceneContainerStyle,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle,
        tabBarLabelStyle: {
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

      <Tabs.Screen name="homeworks" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="remarks" options={{ href: null }} />
      <Tabs.Screen name="exams" options={{ href: null }} />
      <Tabs.Screen
        name="announcement-detail"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="homework-detail"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="exam-detail"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="remark-detail"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="attendance-detail"
        options={{ href: null, headerShown: false }}
      />
    </Tabs>
  );
}

export default function StudentLayout() {
  const Navigator =
    Platform.OS === "web" ? StudentWebStack : StudentNativeTabs;

  return (
    <RoleGate allowedRole="student">
      <StudentMenuProvider>
        <RoleAppFrame
          copyrightBottomOffset={
            Platform.OS === "web" ? 8 : STUDENT_COPYRIGHT_BOTTOM_OFFSET
          }
          reserveContentFooterSpace={Platform.OS !== "web"}
        >
          <Navigator />
        </RoleAppFrame>
      </StudentMenuProvider>
    </RoleGate>
  );
}
