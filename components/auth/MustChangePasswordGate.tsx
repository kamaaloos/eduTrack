import { router, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthContext } from "../../src/context/authContext";
import {
  CHANGE_PASSWORD_ROUTE,
  isChangePasswordSegment,
  isPublicEntrySegment,
} from "../../src/utils/authNavigation";
import { userMustChangePassword } from "../../src/utils/mustChangePassword";

/**
 * Redirects school users with a temporary password to the change-password screen
 * before they can use role routes.
 */
export function MustChangePasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, loading } = useContext(AuthContext);
  const segments = useSegments();
  const firstSegment = segments[0] as string | undefined;
  const onChangePasswordScreen = isChangePasswordSegment(firstSegment);
  const onPublicRoute = isPublicEntrySegment(firstSegment);
  const mustChange = userMustChangePassword(userData);

  useEffect(() => {
    if (loading || !user || !userData || !mustChange) return;
    if (onChangePasswordScreen) return;
    router.replace(CHANGE_PASSWORD_ROUTE as never);
  }, [loading, user, userData, mustChange, onChangePasswordScreen]);

  // Only block entry when nobody is signed in yet. Never unmount the navigator
  // for a signed-in user — that crashes Android during post-login transitions.
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
      {user && mustChange && !onChangePasswordScreen ? (
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
    zIndex: 9998,
  },
});
