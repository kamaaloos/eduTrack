import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { RoleGate } from "../../components/auth/RoleGate";
import { AppScreenBackground } from "../../components/AppScreenBackground";
import { ParentChildProvider } from "../../src/context/parentChildContext";
import {
  floatingTabBarStyle,
  tabSceneContainerStyle,
} from "../../src/constants/tabBar";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../src/context/authContext";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";

function ParentTabs() {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const unreadCount = useUnreadNotificationCount(user?.uid);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: tabSceneContainerStyle,
        sceneContainerStyle: tabSceneContainerStyle,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: floatingTabBarStyle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("tabs.parent.home"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="report-card"
        options={{
          title: t("tabs.parent.reportCard"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          title: t("tabs.parent.alerts"),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: t("tabs.parent.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

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
      <AppScreenBackground copyrightBottomOffset={88}>
        <ParentTabs />
      </AppScreenBackground>
    </ParentChildProvider>
    </RoleGate>
  );
}
