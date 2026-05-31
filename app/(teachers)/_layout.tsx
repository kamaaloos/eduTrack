import { Tabs } from "expo-router";
import { RoleGate } from "../../components/auth/RoleGate";
import { AppScreenBackground } from "../../components/AppScreenBackground";
import {
  hiddenTabBarStyle,
  SHELL_SCENE_CONTAINER_STYLE,
} from "../../src/constants/tabBar";
import {
  TeacherClassesProvider,
} from "../../src/context/teacherClassesContext";
import { TeacherMenuProvider } from "../../src/context/teacherMenuContext";

function TeacherTabs() {

  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        sceneStyle: SHELL_SCENE_CONTAINER_STYLE,
        sceneContainerStyle: SHELL_SCENE_CONTAINER_STYLE,
        tabBarStyle: hiddenTabBarStyle,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="attendance" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="academic" options={{ href: null, headerShown: false }} />
      <Tabs.Screen
        name="absence-reports"
        options={{ href: null, headerShown: false }}
      />
      <Tabs.Screen name="logout" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="exam-reports" options={{ href: null, headerShown: false }} />

      <Tabs.Screen name="students" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="messages" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="homework" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="exams" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="grades" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="class/[id]" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="remarks" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="notifications" options={{ href: null, headerShown: false }} />
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
        <TeacherMenuProvider>
          <AppScreenBackground copyrightBottomOffset={8}>
            <TeacherTabs />
          </AppScreenBackground>
        </TeacherMenuProvider>
      </TeacherClassesProvider>
    </RoleGate>
  );
}
