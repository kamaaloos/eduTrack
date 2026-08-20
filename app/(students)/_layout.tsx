import { Stack, Tabs } from "expo-router";
import { Platform } from "react-native";
import { RoleGate } from "../../components/auth/RoleGate";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import {
  hiddenTabBarStyle,
  SHELL_SCENE_CONTAINER_STYLE,
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

/** Native: tabs shell with bar hidden — side menu is primary navigation. */
function StudentTabs() {
  const sceneStyle =
    Platform.OS === "web"
      ? WEB_SHELL_CONTENT_STYLE
      : SHELL_SCENE_CONTAINER_STYLE;

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        lazy: true,
        detachInactiveScreens: true,
        sceneStyle,
        sceneContainerStyle: sceneStyle,
        tabBarStyle: hiddenTabBarStyle,
      }}
    >
      {STUDENT_STACK_SCREENS.map((name) => (
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
  const Navigator =
    Platform.OS === "web" ? StudentWebStack : StudentTabs;

  return (
    <RoleGate allowedRole="student">
      <StudentMenuProvider>
        <RoleAppFrame copyrightBottomOffset={8}>
          <Navigator />
        </RoleAppFrame>
      </StudentMenuProvider>
    </RoleGate>
  );
}
