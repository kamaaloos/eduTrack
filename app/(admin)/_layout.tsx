import { Stack } from "expo-router";
import { RoleGate } from "../../components/auth/RoleGate";
import { AppScreenBackground } from "../../components/AppScreenBackground";
import { AdminDataProvider } from "../../src/context/adminDataContext";

export default function AdminLayout() {
  return (
    <RoleGate allowedRole="admin">
    <AdminDataProvider>
      <AppScreenBackground copyrightBottomOffset={8}>
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
        <Stack.Screen name="class-directory" />
        <Stack.Screen name="classes" />
        <Stack.Screen name="assignments" />
        <Stack.Screen name="system" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="performance" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="teachers" />
        <Stack.Screen name="academic" />
        </Stack>
      </AppScreenBackground>
    </AdminDataProvider>
    </RoleGate>
  );
}
