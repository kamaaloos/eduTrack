import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AppScreenBackground } from "../../components/AppScreenBackground";
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
      <AppScreenBackground copyrightBottomOffset={8}>
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
      </AppScreenBackground>
    </SuperAdminGate>
  );
}
