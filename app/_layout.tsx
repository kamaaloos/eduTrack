import "../src/i18n";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MustChangePasswordGate } from "../components/auth/MustChangePasswordGate";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider } from "../src/context/authContext";
import { LanguageProvider } from "../src/context/languageContext";
import { SchoolProvider } from "../src/context/schoolContext";
import { SuperAdminAuthProvider } from "../src/context/superAdminAuthContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <SchoolProvider>
          <SuperAdminAuthProvider>
            <AuthProvider>
              <ErrorBoundary>
                <MustChangePasswordGate>
                  <Stack screenOptions={{ headerShown: false }} />
                </MustChangePasswordGate>
              </ErrorBoundary>
            </AuthProvider>
          </SuperAdminAuthProvider>
        </SchoolProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
