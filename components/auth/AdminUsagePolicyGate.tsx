import { router, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthContext } from "../../src/context/authContext";
import {
  isAdminUsagePolicySegment,
  isChangePasswordSegment,
  isPublicEntrySegment,
} from "../../src/utils/authNavigation";
import { userMustChangePassword } from "../../src/utils/mustChangePassword";
import {
  ADMIN_USAGE_POLICY_ROUTE,
  adminMustAcceptUsagePolicy,
} from "../../src/utils/usagePolicy";

/**
 * Redirects school administrators to the usage policy screen before admin routes.
 */
export function AdminUsagePolicyGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useContext(AuthContext);
  const segments = useSegments();
  const firstSegment = segments[0] as string | undefined;
  const onPolicyScreen = isAdminUsagePolicySegment(firstSegment);
  const onChangePasswordScreen = isChangePasswordSegment(firstSegment);
  const onPublicRoute = isPublicEntrySegment(firstSegment);
  const mustAccept =
    userData?.role === "admin" && adminMustAcceptUsagePolicy(userData);
  const mustChangePassword = userMustChangePassword(userData);

  useEffect(() => {
    if (loading || !user || !userData || !mustAccept || mustChangePassword) {
      return;
    }
    if (onPolicyScreen) {
      return;
    }
    router.replace(ADMIN_USAGE_POLICY_ROUTE as never);
  }, [
    loading,
    user,
    userData,
    mustAccept,
    mustChangePassword,
    onPolicyScreen,
  ]);

  if (loading && !user && !onPublicRoute) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      {children}
      {user && mustAccept && !mustChangePassword && !onPolicyScreen ? (
        <View style={styles.blocker}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  blocker: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    zIndex: 9997,
  },
});
