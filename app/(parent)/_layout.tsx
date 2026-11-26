import { Stack, Tabs } from "expo-router";
import type { ReactNode } from "react";
import { Platform } from "react-native";
import { RoleGate } from "../../components/auth/RoleGate";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import {
  hiddenTabBarStyle,
  SHELL_SCENE_CONTAINER_STYLE,
  WEB_SHELL_CONTENT_STYLE,
} from "../../src/constants/tabBar";
import {
  ParentChildProvider,
  useParentChild,
} from "../../src/context/parentChildContext";
import { ParentMenuProvider } from "../../src/context/parentMenuContext";

const PARENT_STACK_SCREENS = [
  "dashboard",
  "report-card",
  "notifications",
  "complaints",
  "account",
  "student/[id]",
  "report-absence",
  "respond-attendance",
  "detail",
] as const;

function ParentWebStack() {
  return (
    <Stack
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: WEB_SHELL_CONTENT_STYLE,
      }}
    >
      {PARENT_STACK_SCREENS.map((name) => (
        <Stack.Screen key={name} name={name} />
      ))}
    </Stack>
  );
}

function ParentTabs() {
  const sceneStyle =
    Platform.OS === "web"
      ? WEB_SHELL_CONTENT_STYLE
      : SHELL_SCENE_CONTAINER_STYLE;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        detachInactiveScreens: true,
        sceneStyle,
        sceneContainerStyle: sceneStyle,
        tabBarStyle: hiddenTabBarStyle,
      }}
    >
      {PARENT_STACK_SCREENS.map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ href: null, headerShown: false }}
        />
      ))}
    </Tabs>
  );
}

function ParentShell({ children }: { children: ReactNode }) {
  const { selectedChild } = useParentChild();
  const viewingChild = Boolean(selectedChild);

  return (
    <RoleAppFrame
      showCopyright={!viewingChild}
      reserveContentFooterSpace={!viewingChild}
      copyrightBottomOffset={viewingChild ? 0 : 8}
    >
      {children}
    </RoleAppFrame>
  );
}

export default function ParentLayout() {
  const Navigator = Platform.OS === "web" ? ParentWebStack : ParentTabs;

  return (
    <RoleGate allowedRole="parent">
      <ParentChildProvider>
        <ParentMenuProvider>
          <ParentShell>
            <Navigator />
          </ParentShell>
        </ParentMenuProvider>
      </ParentChildProvider>
    </RoleGate>
  );
}
