import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { RoleGate } from "../../components/auth/RoleGate";
import { AppScreenBackground } from "../../components/AppScreenBackground";
import {
  floatingTabBarStyle,
  tabSceneContainerStyle,
} from "../../src/constants/tabBar";
import {
  TeacherClassesProvider,
  useTeacherClassesContext,
} from "../../src/context/teacherClassesContext";
import { useTeacherPendingAbsenceCount } from "../../hooks/useTeacherPendingAbsenceCount";

function TeacherTabs() {
  const { t } = useTranslation();
  const { classes, teacherId } = useTeacherClassesContext();
  const classIds = classes.map((c) => c.id);
  const pendingAbsenceCount = useTeacherPendingAbsenceCount(
    teacherId,
    classIds,
  );

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        sceneStyle: tabSceneContainerStyle,
        sceneContainerStyle: tabSceneContainerStyle,
        tabBarShowLabel: true,
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
          title: t("tabs.teacher.home"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: t("tabs.teacher.attendance"),
          tabBarBadge:
            pendingAbsenceCount > 0 ? pendingAbsenceCount : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="academic"
        options={{
          title: t("tabs.teacher.academic"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="absence-reports"
        options={{
          title: t("tabs.teacher.absences"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="logout"
        options={{
          title: t("tabs.teacher.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen name="students" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="messages" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="homework" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="exams" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="grades" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="class/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="remarks" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ href: null, headerShown: false }} />
      <Tabs.Screen
        name="exam-reports"
        options={{
          title: t("tabs.teacher.grades"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ribbon" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="student-report/[studentId]"
        options={{ href: null, headerShown: false }}
      />
    </Tabs>
  );
}

export default function TeacherLayout() {
  return (
    <RoleGate allowedRole="teacher">
    <TeacherClassesProvider>
      <AppScreenBackground copyrightBottomOffset={88}>
        <TeacherTabs />
      </AppScreenBackground>
    </TeacherClassesProvider>
    </RoleGate>
  );
}
