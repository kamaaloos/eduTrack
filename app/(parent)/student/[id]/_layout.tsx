import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "../../../../components/haptic-tab";
import {
  floatingTabBarStyleForSafeArea,
  tabBarItemStyle,
  tabBarLabelStyle,
  tabSceneContainerStyle,
} from "../../../../src/constants/tabBar";
import { useSchoolTheme } from "../../../../src/context/schoolThemeContext";

const CHILD_TAB_SCREENS = [
  "index",
  "messages",
  "announcements",
  "schedule",
  "more",
] as const;

const TAB_ICONS: Record<
  (typeof CHILD_TAB_SCREENS)[number],
  keyof typeof Ionicons.glyphMap
> = {
  index: "home-outline",
  messages: "chatbubble-ellipses-outline",
  announcements: "megaphone-outline",
  schedule: "calendar-outline",
  more: "ellipsis-horizontal-circle-outline",
};

export default function ParentChildTabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useSchoolTheme();

  const titles: Record<(typeof CHILD_TAB_SCREENS)[number], string> = {
    index: t("tabs.student.home"),
    messages: t("tabs.student.messages"),
    announcements: t("tabs.student.announcements"),
    schedule: t("tabs.student.schedule"),
    more: t("tabs.student.more"),
  };

  return (
    <Tabs
      initialRouteName="index"
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
      {CHILD_TAB_SCREENS.map((name) => (
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
    </Tabs>
  );
}
