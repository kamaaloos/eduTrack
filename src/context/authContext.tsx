import { createContext, useEffect, useRef, useState } from "react";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

import { router } from "expo-router";

import i18n from "../i18n";
import { auth, db } from "../services/firebase";
import { getSchoolRegistryEntry } from "../services/schoolRegistry";
import { notifyFirestoreClosing } from "../services/firestoreSession";
import { clearPushTokenFromProfile } from "../services/pushNotifications";
import { isSchoolRole } from "../utils/schoolRoles";
import { isSchoolEntitled } from "../utils/schoolSubscriptionAccess";
import { useSchoolContext } from "./schoolContext";

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const { selectedSchool, schoolReady, resetSchoolSession } = useSchoolContext();
  const selectedSchoolId = selectedSchool?.id ?? null;
  const sessionRef = useRef<{ uid: string | null; schoolId: string | null }>({
    uid: null,
    schoolId: null,
  });
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

    if (!selectedSchoolId || !auth || !db) {
      sessionRef.current = { uid: null, schoolId: null };
      setUser(null);
      setUserData(null);
      setRole(null);
      setLoading(false);
      return;
    }

    const sameSchoolSession =
      sessionRef.current.schoolId === selectedSchoolId &&
      sessionRef.current.uid === auth.currentUser?.uid &&
      Boolean(sessionRef.current.uid);

    if (!sameSchoolSession) {
      setLoading(true);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setError(null);

        if (!currentUser) {
          sessionRef.current = { uid: null, schoolId: null };
          setUser(null);
          setUserData(null);
          setRole(null);
          setLoading(false);
          return;
        }

        const profileRefreshOnly =
          sessionRef.current.uid === currentUser.uid &&
          sessionRef.current.schoolId === selectedSchoolId;

        if (!profileRefreshOnly) {
          setLoading(true);
        }

        if (selectedSchoolId !== "default") {
          const registryEntry = await getSchoolRegistryEntry(selectedSchoolId);
          if (!registryEntry || !isSchoolEntitled(registryEntry)) {
            await denyAccess(i18n.t("common.subscriptionExpired"));
            await resetSchoolSession();
            setLoading(false);
            return;
          }
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

        sessionRef.current = { uid: currentUser.uid, schoolId: selectedSchoolId };
        setUserData({ ...fetchedUserData, uid: currentUser.uid });
        setRole(userRole);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Authentication error occurred";
        setError(message);
        console.error("AUTH ERROR:", err);
        sessionRef.current = { uid: null, schoolId: null };
        setUser(null);
        setUserData(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [schoolReady, selectedSchoolId, resetSchoolSession]);

  const logout = async () => {
    notifyFirestoreClosing();

    if (!auth) {
      await resetSchoolSession();
      router.replace("/select-school");
      return;
    }
    try {
      setError(null);
      const uid = auth.currentUser?.uid;
      if (uid) {
        await clearPushTokenFromProfile(uid);
      }
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setRole(null);
      await resetSchoolSession();
      router.replace("/select-school");
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
