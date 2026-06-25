import { Stack } from "expo-router";
import { RoleGate } from "../../components/auth/RoleGate";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import { AdminDataProvider } from "../../src/context/adminDataContext";
import { AdminMenuProvider } from "../../src/context/adminMenuContext";

export default function AdminLayout() {
  return (
    <RoleGate allowedRole="admin">
      <AdminDataProvider>
        <AdminMenuProvider>
        <RoleAppFrame copyrightBottomOffset={8}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: "transparent" },
            }}
          >
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="users" />
            <Stack.Screen name="user-directory/[role]" />
            <Stack.Screen name="parent/[parentId]" />
            <Stack.Screen name="class-directory" />
            <Stack.Screen name="class/[classId]" />
            <Stack.Screen name="classes" />
            <Stack.Screen name="assignments" />
            <Stack.Screen name="system" />
            <Stack.Screen name="analytics" />
            <Stack.Screen name="performance" />
            <Stack.Screen name="certificates" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="complaints" />
            <Stack.Screen name="teachers" />
            <Stack.Screen name="academic" />
          </Stack>
        </RoleAppFrame>
        </AdminMenuProvider>
      </AdminDataProvider>
    </RoleGate>
  );
}
