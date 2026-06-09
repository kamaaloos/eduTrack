import { AppState } from "react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signOut } from "firebase/auth";
import {
  getSchoolRegistryEntry,
  loadActiveSchools,
} from "../services/schoolRegistry";
import {
  auth,
  connectToSchool,
  disconnectSchool,
} from "../services/firebase";
import type { SchoolRecord, StoredSchool } from "../types/school";
import {
  isSchoolEntitled,
  getSchoolSubscriptionBlockReason,
} from "../utils/schoolSubscriptionAccess";
import { subscriptionBlockMessageKey } from "../utils/subscriptionMessages";
import i18n from "../i18n";
import {
  applyRegistryToStoredSchool,
  storedSchoolNeedsPersist,
  toStoredSchool,
} from "../utils/schoolSelection";
import {
  clearSelectedSchool,
  getSelectedSchool,
  saveSelectedSchool,
} from "../utils/schoolStorage";

type SchoolContextValue = {
  selectedSchool: StoredSchool | null;
  schools: SchoolRecord[];
  schoolReady: boolean;
  schoolsLoading: boolean;
  connecting: boolean;
  error: string | null;
  selectSchool: (school: SchoolRecord) => Promise<void>;
  clearSchool: () => Promise<void>;
  resetSchoolSession: () => Promise<void>;
  reloadSchools: () => Promise<void>;
  refreshSelectedSchoolFromRegistry: () => Promise<StoredSchool | null>;
};

export const SchoolContext = createContext<SchoolContextValue | null>(null);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [selectedSchool, setSelectedSchool] = useState<StoredSchool | null>(
    null,
  );
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [schoolReady, setSchoolReady] = useState(false);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mergeStoredSchoolWithRegistry = useCallback(
    async (stored: StoredSchool): Promise<StoredSchool | null> => {
      const fresh = await getSchoolRegistryEntry(stored.id);
      if (!fresh || !isSchoolEntitled(fresh)) {
        return null;
      }
      const updated = applyRegistryToStoredSchool(stored, fresh);
      if (storedSchoolNeedsPersist(stored, updated)) {
        await saveSelectedSchool(updated);
      }
      return updated;
    },
    [],
  );

  const subscriptionErrorMessage = useCallback((school: SchoolRecord) => {
    const reason = getSchoolSubscriptionBlockReason(school);
    return i18n.t(subscriptionBlockMessageKey(reason));
  }, []);

  const reloadSchools = useCallback(async () => {
    setSchoolsLoading(true);
    setError(null);
    try {
      const list = await loadActiveSchools();
      setSchools(list);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load schools";
      setError(message);
      setSchools([]);
    } finally {
      setSchoolsLoading(false);
    }
  }, []);

  const refreshSelectedSchoolFromRegistry =
    useCallback(async (): Promise<StoredSchool | null> => {
      if (!selectedSchool) return null;
      try {
        const updated = await mergeStoredSchoolWithRegistry(selectedSchool);
        if (!updated) {
          if (auth?.currentUser) {
            await signOut(auth);
          }
          await disconnectSchool();
          await clearSelectedSchool();
          setSelectedSchool(null);
          setError(i18n.t("common.subscriptionExpired"));
          return null;
        }
        if (
          (updated.testingExpiresAt ?? null) !==
            (selectedSchool.testingExpiresAt ?? null) ||
          (updated.usageExpiresAt ?? null) !==
            (selectedSchool.usageExpiresAt ?? null) ||
          updated.name !== selectedSchool.name
        ) {
          setSelectedSchool(updated);
        }
        return updated;
      } catch (err) {
        console.warn("refreshSelectedSchoolFromRegistry failed:", err);
        return selectedSchool;
      }
    }, [mergeStoredSchoolWithRegistry, selectedSchool]);

  useEffect(() => {
    let active = true;
    const readyTimeout = setTimeout(() => {
      if (active) {
        setSchoolReady(true);
      }
    }, 8000);

    void (async () => {
      try {
        await reloadSchools();
        const saved = await getSelectedSchool();
        if (!active) return;

        if (saved) {
          try {
            await connectToSchool(saved.firebase);
            const merged = await mergeStoredSchoolWithRegistry(saved);
            if (!merged) {
              await clearSelectedSchool();
              if (auth?.currentUser) {
                await signOut(auth);
              }
              await disconnectSchool();
              if (active) {
                setError(i18n.t("common.subscriptionExpired"));
                setSelectedSchool(null);
              }
            } else if (active) {
              setSelectedSchool(merged);
            }
          } catch (connectErr) {
            console.warn("Saved school connection failed, clearing selection:", connectErr);
            await clearSelectedSchool();
            if (active) {
              setSelectedSchool(null);
            }
          }
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error ? err.message : "Failed to connect to school";
          setError(message);
        }
      } finally {
        if (active) {
          clearTimeout(readyTimeout);
          setSchoolReady(true);
        }
      }
    })();

    return () => {
      active = false;
      clearTimeout(readyTimeout);
    };
  }, [reloadSchools, mergeStoredSchoolWithRegistry]);

  useEffect(() => {
    if (!selectedSchool) return;

    const verifySubscription = () => {
      void refreshSelectedSchoolFromRegistry();
    };

    verifySubscription();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        verifySubscription();
      }
    });

    return () => sub.remove();
  }, [selectedSchool, refreshSelectedSchoolFromRegistry]);

  useEffect(() => {
    if (!selectedSchool || schools.length === 0) return;
    const match = schools.find((school) => school.id === selectedSchool.id);
    if (!match) return;

    const nextTesting = match.testingExpiresAt ?? null;
    const currentTesting = selectedSchool.testingExpiresAt ?? null;
    const nextUsage = match.usageExpiresAt ?? null;
    const currentUsage = selectedSchool.usageExpiresAt ?? null;
    if (
      match.name === selectedSchool.name &&
      nextTesting === currentTesting &&
      nextUsage === currentUsage
    ) {
      return;
    }

    const updated: StoredSchool = {
      ...selectedSchool,
      name: match.name,
      testingExpiresAt: nextTesting,
      usageExpiresAt: nextUsage,
    };
    void saveSelectedSchool(updated).then(() => setSelectedSchool(updated));
  }, [schools, selectedSchool]);

  const selectSchool = useCallback(async (school: SchoolRecord) => {
    setConnecting(true);
    setError(null);
    try {
      if (!isSchoolEntitled(school)) {
        throw new Error(subscriptionErrorMessage(school));
      }
      await connectToSchool(school.firebase);
      const stored = toStoredSchool(school);
      await saveSelectedSchool(stored);
      setSelectedSchool(stored);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to connect to school";
      setError(message);
      throw new Error(message);
    } finally {
      setConnecting(false);
    }
  }, [subscriptionErrorMessage]);

  const clearSchool = useCallback(async () => {
    setError(null);
    try {
      if (auth?.currentUser) {
        await signOut(auth);
      }
      await disconnectSchool();
      await clearSelectedSchool();
      setSelectedSchool(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to change school";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const resetSchoolSession = useCallback(async () => {
    setError(null);
    await disconnectSchool();
    await clearSelectedSchool();
    setSelectedSchool(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedSchool,
      schools,
      schoolReady,
      schoolsLoading,
      connecting,
      error,
      selectSchool,
      clearSchool,
      resetSchoolSession,
      reloadSchools,
      refreshSelectedSchoolFromRegistry,
    }),
    [
      selectedSchool,
      schools,
      schoolReady,
      schoolsLoading,
      connecting,
      error,
      selectSchool,
      clearSchool,
      resetSchoolSession,
      reloadSchools,
      refreshSelectedSchoolFromRegistry,
    ],
  );

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  );
}

export function useSchoolContext() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error("useSchoolContext must be used within SchoolProvider");
  }
  return context;
}
