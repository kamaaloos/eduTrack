import { Stack } from "expo-router";
import { RoleGate } from "../../components/auth/RoleGate";
import { RoleAppFrame } from "../../components/layout/RoleAppFrame";
import { SecretaryDataProvider } from "../../src/context/secretaryDataContext";
import { SecretaryMenuProvider } from "../../src/context/secretaryMenuContext";

export default function SecretaryLayout() {
  return (
    <RoleGate allowedRole="secretary">
      <SecretaryDataProvider>
        <SecretaryMenuProvider>
          <RoleAppFrame copyrightBottomOffset={8}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
                contentStyle: { backgroundColor: "transparent" },
              }}
            >
              <Stack.Screen name="dashboard" />
              <Stack.Screen name="parent/[parentId]" />
            </Stack>
          </RoleAppFrame>
        </SecretaryMenuProvider>
      </SecretaryDataProvider>
    </RoleGate>
  );
}
