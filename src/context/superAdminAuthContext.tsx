import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";
import { registryAuth, registryDb } from "../services/firebase";
import { clearLocalSessionPreferences } from "../utils/authNavigation";
import { useSchoolContext } from "./schoolContext";

type SuperAdminAuthContextValue = {
  user: User | null;
  userData: Record<string, unknown> | null;
  role: string | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
};

export const SuperAdminAuthContext =
  createContext<SuperAdminAuthContextValue | null>(null);

export function SuperAdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resetSchoolSession } = useSchoolContext();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<Record<string, unknown> | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(registryAuth, async (currentUser) => {
      try {
        setError(null);

        if (!currentUser) {
          setUser(null);
          setUserData(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const profileSnap = await getDoc(
          doc(registryDb, "users", currentUser.uid),
        );

        if (!profileSnap.exists()) {
          setError("Super admin profile not found in registry.");
          setUserData(null);
          setRole(null);
          setLoading(false);
          return;
        }

        const profile = profileSnap.data();
        const userRole = String(profile.role ?? "");

        if (userRole !== "superAdmin") {
          setError("This account is not authorized as a platform administrator.");
          setUserData(profile);
          setRole(userRole || null);
          setLoading(false);
          return;
        }

        setUserData(profile);
        setRole("superAdmin");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Super admin authentication failed";
        setError(message);
        setUser(null);
        setUserData(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    setError(null);
    await signOut(registryAuth);
    setUser(null);
    setUserData(null);
    setRole(null);
    await clearLocalSessionPreferences();
    await resetSchoolSession();
    router.replace("/onboarding");
  };

  const value = useMemo(
    () => ({
      user,
      userData,
      role,
      loading,
      error,
      logout,
    }),
    [user, userData, role, loading, error],
  );

  return (
    <SuperAdminAuthContext.Provider value={value}>
      {children}
    </SuperAdminAuthContext.Provider>
  );
}

export function useSuperAdminAuth() {
  const context = useContext(SuperAdminAuthContext);
  if (!context) {
    throw new Error("useSuperAdminAuth must be used within SuperAdminAuthProvider");
  }
  return context;
}
