import { router } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../../src/context/authContext";
import { getRoleHomeRoute } from "../../src/utils/authNavigation";
import { isSchoolRole, type SchoolRole } from "../../src/utils/schoolRoles";

type RoleGateProps = {
  allowedRole: SchoolRole;
  children: React.ReactNode;
};

/**
 * Restricts a role route group to the signed-in user's school role.
 * Wrong role → redirect to that user's home; signed out → login.
 */
export function RoleGate({ allowedRole, children }: RoleGateProps) {
  const { user, role, loading } = useContext(AuthContext);

  useEffect(() => {
    if (loading) return;

    if (!user || !isSchoolRole(role)) {
      router.replace("/login");
      return;
    }

    if (role !== allowedRole) {
      router.replace(getRoleHomeRoute(role) as never);
    }
  }, [loading, user, role, allowedRole]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!user || !isSchoolRole(role) || role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
