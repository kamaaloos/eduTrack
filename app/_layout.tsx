import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../src/i18n";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppDialogHost } from "../components/dialog/AppDialogHost";
import { configureForegroundNotifications } from "../src/services/pushNotifications";
import { WebAppShell } from "../components/layout/WebAppShell";
import { WebIconFontGate } from "../components/layout/WebIconFontGate";
import { BrandedSplashGate } from "../components/BrandedSplashGate";
import { FirebaseBootstrapGate } from "../components/FirebaseBootstrapGate";
import { DeferredPushNotificationsSetup } from "../components/DeferredPushNotificationsSetup";
import { MustChangePasswordGate } from "../components/auth/MustChangePasswordGate";
import { AdminUsagePolicyGate } from "../components/auth/AdminUsagePolicyGate";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider } from "../src/context/authContext";
import { LanguageProvider } from "../src/context/languageContext";
import { SchoolProvider } from "../src/context/schoolContext";
import { SuperAdminAuthProvider } from "../src/context/superAdminAuthContext";

export default function RootLayout() {
  if (Platform.OS !== "web") {
    configureForegroundNotifications();
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <FirebaseBootstrapGate>
            <SchoolProvider>
              <WebAppShell>
                <WebIconFontGate>
                <BrandedSplashGate>
                <ErrorBoundary>
                  <SuperAdminAuthProvider>
                    <AuthProvider>
                      <DeferredPushNotificationsSetup />
                      <MustChangePasswordGate>
                        <AdminUsagePolicyGate>
                        <Stack
                          screenOptions={{
                            headerShown: false,
                            animation: Platform.OS === "android" ? "fade" : "default",
                          }}
                        />
                        <AppDialogHost />
                        </AdminUsagePolicyGate>
                      </MustChangePasswordGate>
                    </AuthProvider>
                  </SuperAdminAuthProvider>
                </ErrorBoundary>
                </BrandedSplashGate>
                </WebIconFontGate>
              </WebAppShell>
            </SchoolProvider>
          </FirebaseBootstrapGate>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
