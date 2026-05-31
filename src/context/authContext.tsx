import { createContext, useEffect, useState } from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { router } from "expo-router";

import i18n from "../i18n";
import { auth, db } from "../services/firebase";
import { notifyFirestoreClosing } from "../services/firestoreSession";
import { clearLocalSessionPreferences } from "../utils/authNavigation";
import { isSchoolRole } from "../utils/schoolRoles";
import { useSchoolContext } from "./schoolContext";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const { selectedSchool, schoolReady, resetSchoolSession } = useSchoolContext();
  const [user, setUser] = useState<any>(null);

  const [userData, setUserData] = useState<any>(null);

  const [role, setRole] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const denyAccess = async (message: string) => {
    setError(message);
    setUserData(null);
    setRole(null);
    if (auth?.currentUser) {
      try {
        await signOut(auth);
      } catch {
        /* ignore */
      }
    }
    setUser(null);
  };

  useEffect(() => {
    if (!schoolReady) return;

    if (!selectedSchool || !auth || !db) {
      setUser(null);
      setUserData(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await denyAccess(i18n.t("common.profileNotFound"));
          setLoading(false);
          return;
        }

        const fetchedUserData = userSnap.data();
        const userRole = fetchedUserData.role;

        if (!isSchoolRole(userRole)) {
          await denyAccess(i18n.t("common.profileMissingRole"));
          setLoading(false);
          return;
        }

        setUserData({ ...fetchedUserData, uid: currentUser.uid });
        setRole(userRole);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Authentication error occurred";
        setError(message);
        console.error("AUTH ERROR:", err);
        setUser(null);
        setUserData(null);
        setRole(null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 0);
      }
    });

    return unsubscribe;
  }, [schoolReady, selectedSchool]);

  const logout = async () => {
    notifyFirestoreClosing();

    if (!auth) {
      await clearLocalSessionPreferences();
      await resetSchoolSession();
      router.replace("/onboarding");
      return;
    }
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setRole(null);
      await clearLocalSessionPreferences();
      await resetSchoolSession();
      router.replace("/onboarding");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout failed";
      setError(message);
      throw new Error(message);
    }
  };

  const refreshUserProfile = async () => {
    if (!auth || !db) return;
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    try {
      await currentUser.reload();
      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      if (userSnap.exists()) {
        const fetchedUserData = userSnap.data();
        if (isSchoolRole(fetchedUserData.role)) {
          setUserData({ ...fetchedUserData, uid: currentUser.uid });
          setRole(fetchedUserData.role);
        }
      }
      setUser(auth.currentUser);
    } catch (err) {
      console.error("refreshUserProfile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        role,
        loading,
        error,
        logout,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
