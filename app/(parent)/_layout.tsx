import { Tabs, useSegments } from "expo-router";
import { RoleGate } from "../../components/auth/RoleGate";
import { AppScreenBackground } from "../../components/AppScreenBackground";
import { MenuOverlayButton } from "../../components/navigation/MenuOverlayButton";
import { ParentChildProvider } from "../../src/context/parentChildContext";
import {
  ParentMenuProvider,
  useParentMenu,
} from "../../src/context/parentMenuContext";
import {
  hiddenTabBarStyle,
  SHELL_SCENE_CONTAINER_STYLE,
} from "../../src/constants/tabBar";

const PARENT_SHELL_ROUTES = new Set([
  "dashboard",
  "report-card",
  "notifications",
  "account",
]);

function ParentMenuOverlay() {
  const { openMenu } = useParentMenu();
  const segments = useSegments();
  const route = segments.at(-1) ?? "";
  const parentSegment = segments.at(-2) ?? "";
  const onChildDashboard = parentSegment === "student";
  const showOverlay = !PARENT_SHELL_ROUTES.has(route) && !onChildDashboard;

  if (!showOverlay) return null;
  return <MenuOverlayButton onPress={openMenu} />;
}

function ParentTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: SHELL_SCENE_CONTAINER_STYLE,
        sceneContainerStyle: SHELL_SCENE_CONTAINER_STYLE,
        tabBarStyle: hiddenTabBarStyle,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="report-card" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="account" options={{ href: null, headerShown: false }} />

      <Tabs.Screen name="student/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen
        name="report-absence"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen
        name="respond-attendance"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen name="detail" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}

export default function ParentLayout() {
  return (
    <RoleGate allowedRole="parent">
      <ParentChildProvider>
        <ParentMenuProvider>
          <AppScreenBackground copyrightBottomOffset={8}>
            <ParentTabs />
            <ParentMenuOverlay />
          </AppScreenBackground>
        </ParentMenuProvider>
      </ParentChildProvider>
    </RoleGate>
  );
}
