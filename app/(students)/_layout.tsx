import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RoleGate } from "../../components/auth/RoleGate";
import { HapticTab } from "../../components/haptic-tab";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import {
  floatingTabBarStyleForSafeArea,
  tabBarItemStyle,
  tabBarLabelStyle,
  tabSceneContainerStyle,
} from "../../src/constants/tabBar";
import { StudentMenuProvider } from "../../src/context/studentMenuContext";
import { useSchoolTheme } from "../../src/context/schoolThemeContext";

const STUDENT_TAB_SCREENS = [
  "dashboard",
  "messages",
  "announcements",
  "schedule",
  "more",
] as const;

const STUDENT_HIDDEN_SCREENS = [
  "attendance",
  "analytics",
  "notifications",
  "report-card",
  "account",
  "homeworks",
  "remarks",
  "exams",
  "announcement-detail",
  "homework-detail",
  "exam-detail",
  "remark-detail",
  "attendance-detail",
] as const;

const TAB_ICONS: Record<
  (typeof STUDENT_TAB_SCREENS)[number],
  keyof typeof Ionicons.glyphMap
> = {
  dashboard: "home-outline",
  messages: "chatbubble-ellipses-outline",
  announcements: "megaphone-outline",
  schedule: "calendar-outline",
  more: "ellipsis-horizontal-circle-outline",
};

function StudentTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useSchoolTheme();

  const titles: Record<(typeof STUDENT_TAB_SCREENS)[number], string> = {
    dashboard: t("tabs.student.home"),
    messages: t("tabs.student.messages"),
    announcements: t("tabs.student.announcements"),
    schedule: t("tabs.student.schedule"),
    more: t("tabs.student.more"),
  };

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        lazy: true,
        detachInactiveScreens: true,
        sceneStyle: tabSceneContainerStyle,
        sceneContainerStyle: tabSceneContainerStyle,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.primaryColor,
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: floatingTabBarStyleForSafeArea(insets.bottom),
        tabBarLabelStyle,
        tabBarItemStyle,
      }}
    >
      {STUDENT_TAB_SCREENS.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: titles[name],
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={TAB_ICONS[name]} size={size ?? 22} color={color} />
            ),
          }}
        />
      ))}
      {STUDENT_HIDDEN_SCREENS.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ href: null, headerShown: false }}
        />
      ))}
    </Tabs>
  );
}

export default function StudentLayout() {
  return (
    <RoleGate allowedRole="student">
      <StudentMenuProvider>
        <RoleAppFrame
          showCopyright={false}
          reserveContentFooterSpace={false}
          copyrightBottomOffset={0}
        >
          <StudentTabs />
        </RoleAppFrame>
      </StudentMenuProvider>
    </RoleGate>
  );
}
