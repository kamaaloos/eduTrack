import { router } from "expo-router";
import { useContext, useEffect, useMemo } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../../src/context/authContext";
import { getRoleHomeRoute, getSignedOutRoute } from "../../src/utils/authNavigation";
import { isSchoolRole, type SchoolRole } from "../../src/utils/schoolRoles";

type RoleGateProps = {
  allowedRole?: SchoolRole;
  allowedRoles?: SchoolRole[];
  children: React.ReactNode;
};

function resolveAllowedRoles(
  allowedRole?: SchoolRole,
  allowedRoles?: SchoolRole[],
): SchoolRole[] {
  if (allowedRoles && allowedRoles.length > 0) {
    return allowedRoles;
  }
  if (allowedRole) {
    return [allowedRole];
  }
  throw new Error("RoleGate requires allowedRole or allowedRoles");
}

/**
 * Restricts a role route group to the signed-in user's school role.
 * Wrong role → redirect to that user's home; signed out → login.
 */
export function RoleGate({
  allowedRole,
  allowedRoles,
  children,
}: RoleGateProps) {
  const { user, role, loading } = useContext(AuthContext);
  const permitted = useMemo(
    () => resolveAllowedRoles(allowedRole, allowedRoles),
    [allowedRole, allowedRoles],
  );

  useEffect(() => {
    if (loading) return;

    if (!user || !isSchoolRole(role)) {
      router.replace(getSignedOutRoute() as never);
      return;
    }

    if (!permitted.includes(role)) {
      router.replace(getRoleHomeRoute(role) as never);
    }
  }, [loading, user, role, permitted]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!user || !isSchoolRole(role) || !permitted.includes(role)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return <>{children}</>;
}
