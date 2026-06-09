import { Stack, Tabs } from "expo-router";
import { Platform } from "react-native";
import { RoleGate } from "../../components/auth/RoleGate";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import {
  hiddenTabBarStyle,
  SHELL_SCENE_CONTAINER_STYLE,
  WEB_SHELL_CONTENT_STYLE,
} from "../../src/constants/tabBar";
import { TeacherClassesProvider } from "../../src/context/teacherClassesContext";
import { TeacherMenuProvider } from "../../src/context/teacherMenuContext";

const TEACHER_STACK_SCREENS = [
  "dashboard",
  "attendance",
  "academic",
  "absence-reports",
  "logout",
  "exam-reports",
  "students",
  "messages",
  "homework",
  "exams",
  "grades",
  "class/[id]",
  "remarks",
  "notifications",
  "student-report/[studentId]",
] as const;

/** Web: one screen at a time (tabs keep all routes mounted → dashboard bleeds through). */
function TeacherWebStack() {
  return (
    <Stack
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: WEB_SHELL_CONTENT_STYLE,
      }}
    >
      {TEACHER_STACK_SCREENS.map((name) => (
        <Stack.Screen key={name} name={name} />
      ))}
    </Stack>
  );
}

function TeacherTabs() {
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
      {TEACHER_STACK_SCREENS.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ href: null, headerShown: false }}
        />
      ))}
    </Tabs>
  );
}

export default function TeacherLayout() {
  const Navigator = Platform.OS === "web" ? TeacherWebStack : TeacherTabs;

  return (
    <RoleGate allowedRole="teacher">
      <TeacherClassesProvider>
        <TeacherMenuProvider>
          <RoleAppFrame copyrightBottomOffset={8}>
            <Navigator />
          </RoleAppFrame>
        </TeacherMenuProvider>
      </TeacherClassesProvider>
    </RoleGate>
  );
}
