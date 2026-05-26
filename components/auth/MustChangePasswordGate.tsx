import { router, useSegments } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../../src/context/authContext";
import {
  CHANGE_PASSWORD_ROUTE,
  isChangePasswordSegment,
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
  const mustChange = userMustChangePassword(userData);

  useEffect(() => {
    if (loading || !user || !userData || !mustChange) return;
    if (onChangePasswordScreen) return;
    router.replace(CHANGE_PASSWORD_ROUTE as never);
  }, [loading, user, userData, mustChange, onChangePasswordScreen]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (user && mustChange && !onChangePasswordScreen) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <>{children}</>;
}
