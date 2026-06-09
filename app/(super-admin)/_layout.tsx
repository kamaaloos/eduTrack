import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import { ScreenBackgroundLayer } from "../../components/ScreenBackgroundLayer";
import { useSuperAdminAuth } from "../../src/context/superAdminAuthContext";

function SuperAdminGate({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useSuperAdminAuth();

  useEffect(() => {
    if (!loading && (!user || role !== "superAdmin")) {
      router.replace("/super-admin/login");
    }
  }, [loading, user, role]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ScreenBackgroundLayer />
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!user || role !== "superAdmin") {
    return null;
  }

  return <>{children}</>;
}

export default function SuperAdminLayout() {
  return (
    <SuperAdminGate>
      <RoleAppFrame copyrightBottomOffset={8}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="schools" />
          <Stack.Screen name="school/[id]" />
          <Stack.Screen name="school-form" />
        </Stack>
      </RoleAppFrame>
    </SuperAdminGate>
  );
}
